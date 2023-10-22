import {Prisma, ProfilePreferences} from "@prisma/client";
import {GuildEmoji, User} from "discord.js";
import React from "react";
import ptBr from "translations";
import {AboutSection, ColumnContainer, LevelHeader, RepBar, RowContainer, StatLine, TopFiveCharacters, XPBar} from "./components";
import {DEFAULT_PREFERENCES, featuredImageStyle, mainStyle, textShadowStyle} from "./styles";

export type UserCardProps = {
  user: User;
  userLevel: number;
  levelEmoji: GuildEmoji | undefined;
  topFiveCharacters: Prisma.CharacterGetPayload<{include: {messages: true}}>[];
  progressBarWidth: number;
  counters: {totalMessages: number; totalCharacters: number};
  mainCharacterWithUser: Prisma.CharacterGetPayload<{include: {user: true; messages: {select: {id: true}}}}>;
  profilePreferences?: ProfilePreferences;
};

export function UserCard({
  userLevel,
  levelEmoji,
  topFiveCharacters: allCharacters,
  progressBarWidth,
  mainCharacterWithUser,
  counters,
  user,
  profilePreferences,
}: UserCardProps) {
  const userImage = user.displayAvatarURL({forceStatic: true, size: 128, extension: "png"});
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <main style={mainStyle(profilePreferences, profilePreferences?.backgroundUrl)}>
      <LevelHeader userLevel={userLevel} profilePreferences={profilePreferences} />
      <RowContainer>
        <img style={featuredImageStyle} src={userImage} width={128} height={128} />
        <ColumnContainer
          gap="0.25rem"
          style={{
            paddingBlock: "0.25rem",
          }}
        >
          <img src={levelEmoji?.url} style={textShadowStyle} width={32} height={32} />
          <p style={{...textShadowStyle, fontSize: "1.5rem", margin: 0, fontWeight: "bold", color: textColor}}>@{user.username}</p>
          <p style={{...textShadowStyle, fontSize: "0.75rem", margin: 0, fontWeight: "bold", color: textColor}}>
            {ptBr.profile.aboutMe.nowUsing} {mainCharacterWithUser.name} {mainCharacterWithUser.surname}
          </p>
          {allCharacters.length && <TopFiveCharacters characters={allCharacters} profilePreferences={profilePreferences} />}
        </ColumnContainer>
      </RowContainer>
      <RowContainer gap="0.5rem">
        <XPBar progressBarWidth={progressBarWidth} profilePreferences={profilePreferences} />
        <RepBar reputation={mainCharacterWithUser.user.reputation} profilePreferences={profilePreferences} />
      </RowContainer>
      <StatLine label={ptBr.profile.stats.totalXp} value={mainCharacterWithUser.user.xp} profilePreferences={profilePreferences} />
      <StatLine label={ptBr.profile.stats.totalPosts} value={counters.totalMessages} profilePreferences={profilePreferences} />
      <StatLine label={ptBr.profile.stats.totalCharacters} value={counters.totalCharacters} profilePreferences={profilePreferences} />
      <AboutSection about={profilePreferences?.about ?? null} profilePreferences={profilePreferences} />
    </main>
  );
}
