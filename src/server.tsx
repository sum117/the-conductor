import {staticPlugin} from "@elysiajs/static";
import {Prisma} from "@prisma/client";
import {Elysia} from "elysia";
import {exists} from "fs/promises";
import path from "path";
import React, {createElement} from "react";
import {renderToReadableStream} from "react-dom/server";
import satori, {SatoriOptions} from "satori";
import sharp from "sharp";
import {prisma} from "./db";
import {getUserLevelDetails} from "./lib/util/helpers";
import {bot} from "./main";
import App from "./react/App";
import {ptBr} from "./translations/ptBr";

const script = Bun.file(path.resolve(import.meta.dir, "../public/index.js"));

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
  target: "browser",
  define: {
    "Bun.env.DISCORD_CLIENT_ID": Bun.env.DISCORD_CLIENT_ID,
    "Bun.env.DISCORD_API_ENDPOINT": Bun.env.DISCORD_API_ENDPOINT,
    "Bun.env.WEBSITE_BASE_URL": Bun.env.WEBSITE_BASE_URL,
  },
});

let isReady = false;
while (!isReady) {
  console.log(script);
  console.log("Waiting for index.js to be built...");
  if (await exists(script?.name ?? "")) isReady = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const app = new Elysia().use(staticPlugin());

const interArrayBuffer = await Bun.file(path.resolve(import.meta.dir, "./fonts/Inter-Regular.ttf")).arrayBuffer();

const options: SatoriOptions = {
  width: 420,
  height: 475,
  fonts: [
    {
      name: "Roboto",
      data: interArrayBuffer,
      weight: 400,
      style: "normal",
    },
  ],
};

const mainStyle: React.CSSProperties = {
  display: "flex",
  padding: "1rem",
  flexDirection: "column",
  borderRadius: "8px",
  rowGap: "1rem",
  backgroundImage: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
  alignItems: "flex-start",
};

const textShadowStyle: React.CSSProperties = {
  filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
};

const boxShadowStyle: React.CSSProperties = {
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

const titleStyle: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: "0.5rem",
  margin: 0,
  fontWeight: "bold",
  color: "white",
};

const statsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "15rem",
  paddingLeft: "2rem",
  color: "white",
  fontSize: "1.25rem",
  ...textShadowStyle,
};

const aboutStyle: React.CSSProperties = {
  alignItems: "center",
  textTransform: "uppercase",
  color: "white",
  fontSize: "1.25rem",
  ...textShadowStyle,
};

const featuredImageStyle: React.CSSProperties = {
  ...boxShadowStyle,
  objectFit: "cover",
  objectPosition: "top",
  borderRadius: "8px",
};

const ColumnContainer = ({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) => (
  <div style={{display: "flex", flexDirection: "column", rowGap: gap, ...style}}>{children}</div>
);
const RowContainer = ({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) => (
  <div style={{display: "flex", columnGap: gap, ...style}}>{children}</div>
);

const LevelHeader = ({userLevel}: {userLevel: number}) => <p style={{...titleStyle, ...textShadowStyle}}>lvl {userLevel}</p>;

const TopFiveCharacters = ({characters}: {characters: Prisma.CharacterGetPayload<{include: {messages: true}}>[]}) => (
  <RowContainer gap="0.25rem">
    {characters.map((character, index) => (
      <ColumnContainer key={character.id} style={{alignItems: "center", position: "relative"}} gap="0.25rem">
        <img
          style={{...featuredImageStyle, border: index === 0 ? "1px solid #F7B32B" : "1px solid transparent"}}
          src={character.imageUrl!}
          width={32}
          height={32}
        />
        <RowContainer style={{justifyContent: "center"}} gap="0.25rem">
          <img style={{width: "0.75rem", height: "0.75rem", filter: "invert(1)"}} src="https://i.imgur.com/2YTmnEB.png" />
          <span style={{...textShadowStyle, fontSize: "0.75rem", margin: 0, fontWeight: "bold", color: "white"}}>{character.messages.length}</span>
        </RowContainer>
      </ColumnContainer>
    ))}
  </RowContainer>
);

const XPBar = ({progressBarWidth}: {progressBarWidth: number}) => (
  <div
    style={{
      ...boxShadowStyle,
      backgroundColor: "#888098",
      padding: "0.25rem 0.5rem",
      borderRadius: "8px",
      display: "flex",
      width: "16rem",
      position: "relative",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        ...boxShadowStyle,
        position: "absolute",
        top: 0,
        left: "0",
        right: `${progressBarWidth}rem`,
        bottom: 0,
        borderRadius: "8px",
        backgroundColor: "#CFB3CD",
      }}
    />
    <span style={{...textShadowStyle, textTransform: "uppercase", fontSize: "1.25rem", fontWeight: "bold", color: "white"}}>xp</span>
  </div>
);

const RepBar = ({reputation}: {reputation: number}) => (
  <div style={{...boxShadowStyle, padding: "0.5rem 2rem", borderRadius: "8px", backgroundColor: "#C9DDFF", display: "flex"}}>
    <span style={{...textShadowStyle, color: "white", fontWeight: "bold", fontSize: "1.125rem"}}>+{reputation}rep</span>
  </div>
);

const StatLine = ({label, value}: {label: string; value: string | number}) => (
  <div style={statsStyle}>
    <span>{label}</span> <span>{value}</span>
  </div>
);

const AboutSection = ({about}: {about: string | null}) => (
  <RowContainer gap="0.25rem" style={{alignItems: "center"}}>
    <RowContainer style={aboutStyle} gap="0.15rem">
      <img style={{width: "2rem", height: "2rem", filter: "invert(1)"}} src="https://i.imgur.com/ESA6hxu.png" />
      <span style={{fontWeight: "bold"}}>{ptBr.profile.aboutMe.title}</span>
    </RowContainer>
    <p
      style={{
        ...textShadowStyle,
        color: "white",
        maxWidth: "18rem",
        margin: "0",
        maxHeight: "5rem",
        overflow: "hidden",
        columnGap: "0.5rem",
        paddingLeft: "2rem",
      }}
    >
      {about ?? ptBr.profile.aboutMe.placeholder}
    </p>
  </RowContainer>
);

app.get("/profile/:id", async ({params, set}) => {
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

    const svg = await satori(
      <main style={mainStyle}>
        <LevelHeader userLevel={userLevel} />
        <RowContainer>
          <img style={featuredImageStyle} src={user.displayAvatarURL({extension: "png", size: 128})} width={128} height={128} />
          <ColumnContainer gap="0.25rem" style={{paddingBlock: "0.25rem"}}>
            <img src={levelEmoji?.url} style={textShadowStyle} width={32} height={32} />
            <p style={{...textShadowStyle, fontSize: "1.5rem", margin: 0, fontWeight: "bold", color: "white"}}>@{user.username}</p>
            <p style={{...textShadowStyle, fontSize: "0.75rem", margin: 0, fontWeight: "bold", color: "white"}}>
              {ptBr.profile.aboutMe.nowUsing} {mainCharacterWithUser.name} {mainCharacterWithUser.surname}
            </p>
            {allCharacters.length && <TopFiveCharacters characters={allCharacters} />}
          </ColumnContainer>
        </RowContainer>
        <RowContainer gap="0.5rem">
          <XPBar progressBarWidth={progressBarWidth} />
          <RepBar reputation={mainCharacterWithUser.user.reputation} />
        </RowContainer>
        <StatLine label={ptBr.profile.stats.totalXp} value={mainCharacterWithUser.user.xp} />
        <StatLine label={ptBr.profile.stats.totalPosts} value={counters.totalMessages} />
        <StatLine label={ptBr.profile.stats.totalCharacters} value={counters.totalCharacters} />
        <AboutSection about={mainCharacterWithUser.user?.about} />
      </main>,
      options,
    );

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(png, {
      headers: {
        "content-type": "image/png",
      },
      status: 200,
    });
  } catch (error) {
    set.status = 500;
    console.error(error);
    return error;
  }
});

app.get("/website", async () => {
  // create our react App component
  const app = createElement(App);

  // render the app component to a readable stream
  const stream = await renderToReadableStream(app, {
    bootstrapScriptContent: await script.text(),
  });

  // output the stream as the response
  return new Response(stream, {
    headers: {"Content-Type": "text/html"},
  });
});

app.get("/discord/callback", async ({query, set, cookie: {token}}) => {
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
  const json = await response.json();
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
  const userJson = await userResponse.json();
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
  token.value = access_token;
  return userData;
});

app.get("/discord/check", async ({cookie: {token}, set}) => {
  const response = await fetch(`${Bun.env.DISCORD_API_ENDPOINT}/users/@me`, {
    headers: {
      authorization: `Bearer ${token.value}`,
    },
  });
  const json = await response.json();
  const {id} = json;
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
  return userData;
});
export default app;
