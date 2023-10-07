import {html} from "@elysiajs/html";
import {Elysia} from "elysia";
import path from "path";
import {SatoriOptions} from "satori";
import {prisma} from "./db";
import {getSatoriImage} from "./image-gen/getSatoriImage";
import {getSatoriOptions} from "./image-gen/getSatoriOptions";
import {getUserLevelDetails} from "./lib/util/helpers";
import {bot} from "./main";

let isReady = false;
while (!isReady) {
  let entrypoint = Bun.file(path.resolve(import.meta.dir, "website/index.tsx"));
  console.log("Waiting for index.js to be built...");
  if (!(await entrypoint.exists())) {
    console.log("index.tsx not found, trying index.js...");
    entrypoint = Bun.file(path.resolve(import.meta.dir, "website/index.js"));
  }

  await Bun.build({
    entrypoints: [entrypoint.name!],
    outdir: "dist",
    target: "browser",
    define: {
      "Bun.env.DISCORD_CLIENT_ID": JSON.stringify(Bun.env.DISCORD_CLIENT_ID),
      "Bun.env.DISCORD_API_ENDPOINT": JSON.stringify(Bun.env.DISCORD_API_ENDPOINT),
      "Bun.env.WEBSITE_BASE_URL": JSON.stringify(Bun.env.WEBSITE_BASE_URL),
    },
  }).catch((error) => console.error(error));

  const script = Bun.file(path.resolve(import.meta.dir, "../dist/index.js"));
  if (await script.exists()) isReady = true;

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const elysiaServer = new Elysia();

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

    const png = await getSatoriImage({userLevel, levelEmoji, allCharacters, progressBarWidth, counters, mainCharacterWithUser, user}, options);

    return new Response(png, {headers: {"content-type": "image/png"}, status: 200});
  } catch (error) {
    set.status = 500;
    console.error(error);
    return error;
  }
});

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
      return Bun.file(path.resolve(import.meta.dir, "../dist", fileName));
    }
    return Bun.file(path.resolve(import.meta.dir, "website/index.html"));
  });

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
      redirect_uri: Bun.env.WEBSITE_BASE_URL,
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
  return userData;
});

elysiaServer
  .derive((context) => {
    const isSignedIn = async () => {
      const response = await fetch(`${Bun.env.DISCORD_API_ENDPOINT}/users/@me`, {
        headers: {
          authorization: `Bearer ${context.cookie.token.value}`,
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
      if (!context.cookie.token.value) {
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
  );

export default elysiaServer;
