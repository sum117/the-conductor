import { Elysia } from "elysia";
import path from "path";
import React from "react";
import satori, { SatoriOptions } from "satori";
import sharp from "sharp";
import { prisma } from "./db";
import { bot } from "./main";
import { ptBr } from "./translations/ptBr";

const app = new Elysia();

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
  display: "flex",
  columnGap: "0.25rem",
  alignItems: "center",
  textTransform: "uppercase",
  color: "white",
  fontSize: "1.25rem",
  ...textShadowStyle,
};

app.get("/profile/:id", async ({params, set}) => {
  try {
    const {id} = params;
    const character = await prisma.character.findFirst({
      where: {userId: id, isBeingUsed: true},
      include: {user: true, faction: true, messages: {select: {id: true}}},
    });
    if (!character || !character.imageUrl) {
      set.status = 404;
      return "Character Not Found";
    }
    const user = await bot.users.fetch(id);
    if (!user) {
      set.status = 404;
      return "User Not Found in Bot Cache";
    }

    const factionEmoji = bot.guilds.cache.first()?.emojis.cache.find((emoji) => emoji.id === character.faction?.emoji.split(":")[2].replace(">", ""));
    const userLevel = Math.max(1, Math.floor(character.user.xp / 10000));
    const percentageToNextLevel = (character.user.xp % 10000) / 100;
    const progressBarWidth = -0.16 * percentageToNextLevel + 16;

    const svg = await satori(
      <main style={mainStyle}>
        <p style={{...titleStyle, ...textShadowStyle}}>lvl {userLevel}</p>

        <div style={{display: "flex", columnGap: "1rem"}}>
          <img style={{...boxShadowStyle, objectFit: "cover", objectPosition: "top", borderRadius: "8px"}} src={character.imageUrl} width={128} height={128} />

          <div style={{display: "flex", flexDirection: "column", paddingBlock: "0.25rem", rowGap: "0.25rem"}}>
            <img src={factionEmoji?.url} style={textShadowStyle} width={32} height={32} />
            <p style={{...textShadowStyle, fontSize: "1.5rem", margin: 0, fontWeight: "bold", color: "white"}}>
              {character.name} {character.surname}
            </p>
            <p style={{...textShadowStyle, fontSize: "0.75rem", margin: 0, fontWeight: "bold", color: "white"}}>@{user.username}</p>
          </div>
        </div>

        <div style={{display: "flex", columnGap: "0.5rem"}}>
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

          <div style={{...boxShadowStyle, padding: "0.5rem 2rem", borderRadius: "8px", backgroundColor: "#C9DDFF", display: "flex"}}>
            <span style={{...textShadowStyle, color: "white", fontWeight: "bold", fontSize: "1.125rem"}}>+{character.user.reputation}rep</span>
          </div>
        </div>

        <div style={statsStyle}>
          <span>Total XP</span> <span>{character.user.xp}</span>
        </div>

        <div style={statsStyle}>
          <span>Total Posts</span> <span>{character.messages.length}</span>
        </div>

        <div style={aboutStyle}>
          <img style={{width: "2rem", height: "2rem", filter: "invert(1)"}} src="https://i.imgur.com/ESA6hxu.png" />
          <span style={{fontWeight: "bold"}}>{ptBr.profile.aboutMe.title}</span>
        </div>
        <p
          style={{
            ...textShadowStyle,
            color: "white",
            maxWidth: "20rem",
            margin: "0",
            maxHeight: "5rem",
            overflow: "hidden",
            columnGap: "0.5rem",
            paddingLeft: "2rem",
          }}
        >
          {character.user?.about ?? ptBr.profile.aboutMe.placeholder}
        </p>
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

export default app;
