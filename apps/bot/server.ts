import {cors} from "@elysiajs/cors";
import {html} from "@elysiajs/html";
import {Prisma, User} from "@prisma/client";
import {Elysia, t} from "elysia";
import lodash from "lodash";
import path from "path";
import {SatoriOptions} from "satori";
import ptBr from "translations";
import {credentials, hasKey} from "utilities";
import {WIKI_CHARACTER_DETAILS_FIELDS} from "./data/constants";
import {prisma} from "./db";
import {CharacterPayload} from "./lib/components/CharacterEmbed";
import {getSatoriImage} from "./lib/image-gen/getSatoriImage";
import {getSatoriOptions} from "./lib/image-gen/getSatoriOptions";
import {getUserLevelDetails} from "./lib/util/helpers";
import {bot} from "./main";

const elysiaServer = new Elysia();
if (Bun.env.NODE_ENV === "development") elysiaServer.use(cors());

const options: SatoriOptions = await getSatoriOptions();

elysiaServer.get("/api/image-gen/profile/:id", async ({params, set}) => {
  try {
    const {id} = params;
    const mainCharacterWithUser = await prisma.character.findFirst({
      where: {userId: id, isBeingUsed: true},
      include: {user: true, messages: {select: {id: true}}},
    });
    if (!mainCharacterWithUser || !mainCharacterWithUser.imageUrl) {
      set.status = "Not Found";
      return "Character Not Found";
    }
    const allCharacters = await prisma.character.findMany({where: {userId: id}, orderBy: {messages: {_count: "desc"}}, include: {messages: true}});

    const counters = allCharacters.reduce(
      (accumulator, character) => {
        accumulator.totalMessages += character.messages.length;
        accumulator.totalCharacters += 1;
        return accumulator;
      },
      {totalMessages: 0, totalCharacters: 0},
    );

    const user = await bot.users.fetch(id);
    if (!user) {
      set.status = "Not Found";
      return "User Not Found in Bot Cache";
    }

    const {userLevel, percentageToNextLevel, emojiId} = getUserLevelDetails(mainCharacterWithUser.user);
    const levelEmoji = bot.guilds.cache.first()?.emojis.cache.find((emoji) => emoji.id === emojiId);
    const progressBarWidth = -0.16 * percentageToNextLevel + 16;

    const png = await getSatoriImage(
      {userLevel, levelEmoji, topFiveCharacters: allCharacters, progressBarWidth, counters, mainCharacterWithUser, user},
      options,
    );

    return new Response(png, {headers: {"content-type": "image/png"}, status: 200});
  } catch (error) {
    set.status = "Internal Server Error";
    console.error(error);
    return error;
  }
});

const WEBSITE_PATH = path.resolve(import.meta.dir, "../website");
type MetaTags = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  color?: string;
};

function replaceMetaTags(html: string, tags?: MetaTags) {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const image = tags?.image ?? ptBr.website.image;
  return html
    .replaceAll("<!--META_TITLE-->", lodash.unescape(tags?.title ?? ptBr.website.title))
    .replaceAll("<!--META_DESCRIPTION-->", lodash.unescape(tags?.description ?? ptBr.website.description))
    .replaceAll("<!--META_IMAGE-->", image)
    .replaceAll("<!--META_URL-->", lodash.unescape(tags?.url ?? ptBr.website.url))
    .replaceAll("<!--META_IMAGE_TYPE-->", image.includes("jpeg") ? "image/jpeg" : "image/png")
    .replaceAll("<!--META_COLOR-->", lodash.unescape(tags?.color ? `#${tags?.color}` : `#${randomColor}`));
}

elysiaServer
  .use(html())
  .onError((context) => {
    if (context.code === "NOT_FOUND") {
      context.set.status = "Not Found";
      return "Not Found";
    }
    context.set.status = "Internal Server Error";
    return "Internal Server Error";
  })
  .get("*", async (context) => {
    const assetsRegex = /\.(js|css|png|jpg|jpeg)$/;
    if (assetsRegex.test(context.request.url)) {
      const fileName = new URL(context.request.url).pathname.split("/").pop();
      if (!fileName) throw new Error("Not Found");

      return Bun.file(path.join(WEBSITE_PATH, fileName));
    }
    const html = await Bun.file(path.join(WEBSITE_PATH, "index.html")).text();
    const htmlToSend = await context.html(replaceMetaTags(html));

    if (context.request.url.includes("wiki/characters")) {
      const characterName = context.request.url.split("/").pop();
      const character = await prisma.character.findFirst({include: {race: true, faction: true}, where: {name: {contains: characterName}}});
      if (!character) return htmlToSend;

      const makeCharacterDescription = () => {
        type KeyOfWikiChar = keyof typeof WIKI_CHARACTER_DETAILS_FIELDS;
        let description = "";
        for (const field in WIKI_CHARACTER_DETAILS_FIELDS) {
          const subFields = WIKI_CHARACTER_DETAILS_FIELDS[field as KeyOfWikiChar];
          description += `${ptBr.characterDetails[field as KeyOfWikiChar]}\n`;
          for (const subField of subFields) {
            const isNested = subField === "faction" || subField === "race";
            if (hasKey(character, subField) && !isNested) description += `${ptBr.character[subField]}: ${character[subField]}\n`;
            else if (hasKey(character, subField) && isNested) description += `${ptBr.character[subField]}: ${character[subField]?.name}\n`;
          }
        }
        return description;
      };

      return context.html(
        replaceMetaTags(html, {
          title: `${character.name} ${character.surname}`,
          description: makeCharacterDescription() ?? ptBr.website.description,
          image: character.imageUrl ?? ptBr.website.image,
          url: `${Bun.env.WEBSITE_BASE_URL}/wiki/characters/${lodash.kebabCase(character.name ?? "")}`,
        }),
      );
    }
    return htmlToSend;
  });

let DEVELOPER_TOKEN: string | undefined;
elysiaServer
  .get("/api/discord/callback", async ({query, set, cookie: {token}}) => {
    const {code} = query;
    if (!code) {
      set.status = "Unauthorized";
      return "Missing Code";
    }
    const response = await fetch(`${Bun.env.DISCORD_API_ENDPOINT}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: Bun.env.DISCORD_CLIENT_ID,
        client_secret: Bun.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: Bun.env.WEBSITE_BASE_URL + "/login",
        scope: "identify",
      }),
    });
    const json = (await response.json()) as {access_token?: string};
    const {access_token} = json;
    if (!access_token) {
      set.status = "Unauthorized";
      return "Missing Access Token";
    }
    const userResponse = await fetch(`${Bun.env.DISCORD_API_ENDPOINT}/users/@me`, {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });
    const userJson = (await userResponse.json()) as {id?: string};
    const {id} = userJson;
    if (!id) {
      set.status = "Unauthorized";
      return "Missing User ID";
    }
    const discordUser = await bot.users.fetch(id);
    if (!discordUser) {
      set.status = "Not Found";
      return "User Not Found in Bot Cache";
    }
    const userData = await prisma.user.findUniqueOrThrow({where: {id}}).catch((error) => {
      if (error.code === "P2025") return prisma.user.create({data: {id}}).catch(console.error) as Promise<User>;
    });
    if (!userData) {
      set.status = "Not Found";
      return "Character Not Found";
    }
    set.status = "OK";

    token.path = "/";
    token.value = access_token;
    if (Bun.env.NODE_ENV === "development") DEVELOPER_TOKEN = access_token;
    return userData;
  })
  .get("/api/discord/logout", async ({set, cookie: {token}}) => {
    set.status = "OK";
    token.path = "/";
    token.value = "";
    token.maxAge = 0;
    return {message: "Logged Out"};
  });

elysiaServer
  .derive((context) => {
    const isSignedIn = async () => {
      const response = await fetch(`${Bun.env.DISCORD_API_ENDPOINT}/users/@me`, {
        headers: {
          authorization: `Bearer ${context.cookie.token.value ?? DEVELOPER_TOKEN}`,
        },
      });
      const json = (await response.json()) as {id?: string};
      const {id} = json;
      if (!id) {
        context.set.status = "Unauthorized";
        return "Missing User ID";
      }
      const discordUser = await bot.users.fetch(id);
      if (!discordUser) {
        context.set.status = "Not Found";
        return "User Not Found in Bot Cache";
      }

      return id;
    };

    return {isSignedIn, cookie: {token: {value: context.cookie.token.value}}};
  })
  .get("/api/discord/check", async (context) => {
    const query = context.query as {q?: string};
    const id = await context.isSignedIn();
    const token = context.cookie.token.value ?? DEVELOPER_TOKEN;
    if (!token) {
      context.set.status = "Unauthorized";
      return "Missing Access Token";
    }
    const userData = await prisma.user.findFirst({where: {id}, include: {characters: {take: 15, where: {name: {contains: query.q ?? ""}}}}});
    if (!userData) {
      context.set.status = "Not Found";
      return "Character Not Found";
    }

    return userData;
  })
  .get("/api/races", async (context) => {
    try {
      const isSignedIn = await context.isSignedIn();
      if (!isSignedIn) {
        context.set.status = "Unauthorized";
        return "Missing Access Token";
      }
      const allRaces = await prisma.race.findMany();
      context.set.status = "OK";
      return allRaces;
    } catch (error) {
      context.set.status = "Internal Server Error";
      console.error(error);
      return error;
    }
  })
  .get("/api/factions", async (context) => {
    try {
      const isSignedIn = await context.isSignedIn();
      if (!isSignedIn) {
        context.set.status = "Unauthorized";
        return "Missing Access Token";
      }
      const allFactions = await prisma.faction.findMany();
      context.set.status = "OK";
      return allFactions;
    } catch (error) {
      context.set.status = "Internal Server Error";
      console.error(error);
      return error;
    }
  })
  .post(
    "/api/characters/create",
    async (context) => {
      const characterData: Prisma.CharacterUncheckedCreateInput = context.body;
      characterData.raceId = parseInt(context.body.race);
      characterData.factionId = parseInt(context.body.faction);
      "race" in characterData && delete characterData.race;
      "faction" in characterData && delete characterData.faction;
      characterData.userId = context.body.userId;
      characterData.isPending = true;
      try {
        const isSignedIn = await context.isSignedIn();
        if (!isSignedIn) {
          context.set.status = "Unauthorized";
          return "Missing Access Token";
        }
        const user = await prisma.user.create({data: {id: context.body.userId}}).catch((error) => {
          if (error.code === "P2002") return prisma.user.findUnique({where: {id: context.body.userId}}) as Promise<User>;
          throw error;
        });

        if (!user) {
          context.set.status = "Not Found";
          return "User Not Found";
        }

        const character = await prisma.character.create({data: characterData, include: {faction: true}});
        const characterPayload = new CharacterPayload({character});
        const evaluationChannel = await bot.channels.fetch(credentials.channels.evaluationChannel);
        if (!evaluationChannel?.isTextBased()) throw new Error("Evaluation Channel is not a Text Channel");
        const message = await evaluationChannel.send(characterPayload);

        context.set.status = "Created";

        return {...character, messageLink: message.url};
      } catch (error) {
        context.set.status = "Internal Server Error";
        console.error(error);
        return error;
      }
    },
    {
      body: t.Object({
        userId: t.String(),
        name: t.String(),
        surname: t.String(),
        personality: t.String(),
        appearance: t.String(),
        backstory: t.String(),
        imageUrl: t.String(),
        age: t.String(),
        height: t.String(),
        gender: t.String(),
        weight: t.String(),
        race: t.String(),
        faction: t.String(),
      }),
    },
  )
  .get("/api/characters", async (context) => {
    const userId = await context.isSignedIn();
    const characters = await prisma.character.findMany({where: {userId, AND: {name: {contains: context.query.q ?? ""}}}});
    context.set.status = "OK";
    return characters;
  })
  .get("/api/characters/:id", async (context) => {
    const userId = await context.isSignedIn();
    const {id} = context.params;
    const character = await prisma.character.findFirst({where: {id: parseInt(id), AND: {userId}}});
    context.set.status = "OK";
    return character;
  })
  .delete("/api/characters/delete/:id", async (context) => {
    const userId = await context.isSignedIn();
    const {id} = context.params;
    const character = await prisma.character.delete({where: {id: parseInt(id), AND: {userId}}});
    context.set.status = "OK";
    return character;
  });

elysiaServer
  .get("/api/wiki/characters", async (context) => {
    const pageSize = context.query.pageSize ? parseInt(context.query.pageSize) : 10;
    const page = context.query.page ? parseInt(context.query.page) : 1;
    const expanded = context.query.expanded ? Boolean(context.query.expanded) : false;

    type WikiCharacterLink = Prisma.CharacterGetPayload<{select: {name: true; id: true; imageUrl: true}}>;
    type WikiCharacter = Prisma.CharacterGetPayload<{include: {faction: true; instruments: true; race: true}}>;

    let characters: WikiCharacter[] | WikiCharacterLink[] = [];

    if (expanded) {
      characters = await prisma.character.findMany({
        include: {faction: true, instruments: true, race: true},
        take: pageSize,
        skip: (page - 1) * pageSize,
      });
    } else {
      characters = await prisma.character.findMany({
        select: {name: true, id: true, imageUrl: true},
        take: pageSize,
        skip: (page - 1) * pageSize,
      });
    }
    const totalPages = Math.ceil((await prisma.character.count()) / pageSize);

    context.set.status = "OK";
    return !expanded
      ? {
          characters: characters
            .filter(
              (character): character is WikiCharacterLink & {link: string; name: string; imageUrl: string} =>
                Boolean(character.name) && Boolean(character.imageUrl) && Boolean(character.id),
            )
            .map((character) => ({...character, link: lodash.kebabCase(character.name!)})),
          totalPages,
        }
      : {characters: characters, totalPages};
  })

  .get("/api/wiki/characters/:name", async (context) => {
    const {name} = context.params;
    const character = await prisma.character.findFirst({where: {name: {contains: name}}, include: {faction: true, instruments: true, race: true}});
    if (!character) {
      context.set.status = "Not Found";
      return "Character Not Found";
    }
    context.set.status = "OK";
    return character;
  })

  .get("/api/wiki/announcements", async (context) => {
    const announcementsChannel = await bot.channels.fetch(credentials.channels.announcementsChannel);
    if (!announcementsChannel?.isTextBased() || !announcementsChannel.lastMessageId) {
      context.set.status = "Not Found";
      return "Announcements Channel Not Found";
    }
    const messages = await announcementsChannel.messages.fetch({limit: 10});
    context.set.status = "OK";
    return messages.map((message) => ({
      content: message.content,
      attachments: message.attachments.filter((attachment) => Boolean(attachment.url)).map((attachment) => attachment.url),
    }));
  });

export default elysiaServer;
