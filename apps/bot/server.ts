import {cors} from "@elysiajs/cors";
import {html} from "@elysiajs/html";
import {Prisma, User} from "@prisma/client";
import {Elysia, t} from "elysia";
import path from "path";
import {SatoriOptions} from "satori";
import {credentials} from "utilities";
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
      set.status = 404;
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
      set.status = 404;
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
    set.status = 500;
    console.error(error);
    return error;
  }
});

const WEBSITE_PATH = path.resolve(import.meta.dir, "../website");

elysiaServer
  .use(html())
  .onError((context) => {
    if (context.code === "NOT_FOUND") {
      context.set.status = 404;
      return "Not Found";
    }
    context.set.status = 500;
    return "Internal Server Error";
  })
  .get("/website/*", async (context) => {
    const assetsRegex = /\.(js|css|png|jpg|jpeg)$/;
    if (assetsRegex.test(context.request.url)) {
      const fileName = new URL(context.request.url).pathname.split("/").pop();
      if (!fileName) throw new Error("Not Found");

      return Bun.file(path.join(WEBSITE_PATH, fileName));
    }
    return Bun.file(path.join(WEBSITE_PATH, "index.html"));
  });

let DEVELOPER_TOKEN: string | undefined;
elysiaServer.get("/api/discord/callback", async ({query, set, cookie: {token}}) => {
  const {code} = query;
  if (!code) {
    set.status = 400;
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
    set.status = 400;
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
    set.status = 400;
    return "Missing User ID";
  }
  const discordUser = await bot.users.fetch(id);
  if (!discordUser) {
    set.status = 404;
    return "User Not Found in Bot Cache";
  }
  const userData = await prisma.user.findFirst({where: {id}, include: {characters: true}});
  if (!userData) {
    set.status = 404;
    return "Character Not Found";
  }
  set.status = 200;
  token.path = "/";
  token.value = access_token;
  if (Bun.env.NODE_ENV === "development") DEVELOPER_TOKEN = access_token;
  return userData;
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
        context.set.status = 400;
        return "Missing User ID";
      }
      const discordUser = await bot.users.fetch(id);
      if (!discordUser) {
        context.set.status = 404;
        return "User Not Found in Bot Cache";
      }

      const userData = await prisma.user.findFirst({where: {id}, include: {characters: true}});
      if (!userData) {
        context.set.status = 404;
        return "Character Not Found";
      }
    };

    return {isSignedIn, cookie: {token: {value: context.cookie.token.value}}};
  })
  .get(
    "/api/discord/check",
    async (context) => {
      const token = context.cookie.token.value ?? DEVELOPER_TOKEN;
      if (!token) {
        context.set.status = 400;
        return "Missing Access Token";
      }
    },
    {beforeHandle: async ({isSignedIn}) => await isSignedIn()},
  )
  .get(
    "/api/races",
    async (context) => {
      try {
        const allRaces = await prisma.race.findMany();
        context.set.status = 200;
        return allRaces;
      } catch (error) {
        context.set.status = 500;
        console.error(error);
        return error;
      }
    },
    {beforeHandle: async ({isSignedIn}) => await isSignedIn()},
  )
  .get(
    "/api/factions",
    async (context) => {
      try {
        const allFactions = await prisma.faction.findMany();
        context.set.status = 200;
        return allFactions;
      } catch (error) {
        context.set.status = 500;
        console.error(error);
        return error;
      }
    },
    {
      beforeHandle: async ({isSignedIn}) => await isSignedIn(),
    },
  )
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
        const user = await prisma.user.create({data: {id: context.body.userId}}).catch((error) => {
          if (error.code === "P2002") return prisma.user.findUnique({where: {id: context.body.userId}}) as Promise<User>;
          throw error;
        });

        if (!user) {
          context.set.status = "Not Found";
          return "User Not Found";
        }

        const character = await prisma.character.create({data: characterData});
        const characterPayload = new CharacterPayload({character});
        const evaluationChannel = await bot.channels.fetch(credentials.channels.evaluationChannel);
        if (!evaluationChannel?.isTextBased()) throw new Error("Evaluation Channel is not a Text Channel");
        const message = await evaluationChannel.send(characterPayload);

        context.set.status = "Created";

        return {...character, messageLink: message.url};
      } catch (error) {
        context.set.status = 500;
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
  );

export default elysiaServer;
