import {Prisma} from "@prisma/client";
import {GuildEmoji, User} from "discord.js";
import React from "react";
import ptBr from "translations";
import {AboutSection, ColumnContainer, LevelHeader, RepBar, RowContainer, StatLine, TopFiveCharacters, XPBar} from "./components";
import {featuredImageStyle, mainStyle, textShadowStyle} from "./styles";

export type UserCardProps = {
  user: User;
  userLevel: number;
  levelEmoji: GuildEmoji | undefined;
  allCharacters: Prisma.CharacterGetPayload<{include: {messages: true}}>[];
  progressBarWidth: number;
  counters: {totalMessages: number; totalCharacters: number};
  mainCharacterWithUser: Prisma.CharacterGetPayload<{include: {user: true; messages: {select: {id: true}}}}>;
};

export function UserCard({userLevel, levelEmoji, allCharacters, progressBarWidth, mainCharacterWithUser, counters, user}: UserCardProps) {
  return (
    <main style={mainStyle}>
      <LevelHeader userLevel={userLevel} />
      <RowContainer>
        <img
          style={featuredImageStyle}
          src={user.displayAvatarURL({
            extension: "png",
            size: 128,
          })}
          width={128}
          height={128}
        />
        <ColumnContainer
          gap="0.25rem"
          style={{
            paddingBlock: "0.25rem",
          }}
        >
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
    </main>
  );
}
