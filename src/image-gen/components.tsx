import {Prisma} from "@prisma/client";
import React from "react";
import {ptBr} from "../translations/ptBr";
import {aboutStyle, boxShadowStyle, featuredImageStyle, statsStyle, textShadowStyle, titleStyle} from "./styles";

export function ColumnContainer({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) {
  return <div style={{display: "flex", flexDirection: "column", rowGap: gap, ...style}}>{children}</div>;
}
export function RowContainer({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) {
  return <div style={{display: "flex", columnGap: gap, ...style}}>{children}</div>;
}
export function LevelHeader({userLevel}: {userLevel: number}) {
  return <p style={{...titleStyle, ...textShadowStyle}}>lvl {userLevel}</p>;
}

export function TopFiveCharacters({characters}: {characters: Prisma.CharacterGetPayload<{include: {messages: true}}>[]}) {
  return (
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
}
export function XPBar({progressBarWidth}: {progressBarWidth: number}) {
  return (
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
}
export function RepBar({reputation}: {reputation: number}) {
  return (
    <div style={{...boxShadowStyle, padding: "0.5rem 2rem", borderRadius: "8px", backgroundColor: "#C9DDFF", display: "flex"}}>
      <span style={{...textShadowStyle, color: "white", fontWeight: "bold", fontSize: "1.125rem"}}>+{reputation}rep</span>
    </div>
  );
}
export function StatLine({label, value}: {label: string; value: string | number}) {
  return (
    <div style={statsStyle}>
      <span>{label}</span> <span>{value}</span>
    </div>
  );
}
export function AboutSection({about}: {about: string | null}) {
  return (
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
}
