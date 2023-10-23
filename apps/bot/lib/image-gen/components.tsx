import {Prisma, ProfilePreferences} from "@prisma/client";
import React from "react";
import ptBr from "translations";
import {DEFAULT_PREFERENCES, aboutStyle, boxShadowStyle, featuredImageStyle, statsStyle, textShadowStyle, titleStyle} from "./styles";

export function ColumnContainer({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) {
  return <div style={{display: "flex", flexDirection: "column", rowGap: gap, ...style}}>{children}</div>;
}
export function RowContainer({gap = "1rem", style, children}: {gap?: string; style?: React.CSSProperties; children: React.ReactNode}) {
  return <div style={{display: "flex", columnGap: gap, ...style}}>{children}</div>;
}
export function LevelHeader({userLevel, profilePreferences}: {userLevel: number; profilePreferences?: ProfilePreferences}) {
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return <p style={{...titleStyle(profilePreferences), ...textShadowStyle, color: textColor}}>lvl {userLevel}</p>;
}

export function TopFiveCharacters({
  characters,
  profilePreferences,
}: {
  characters: Prisma.CharacterGetPayload<{include: {messages: true}}>[];
  profilePreferences?: ProfilePreferences;
}) {
  const featuredCharacterBorderColor = profilePreferences?.featuredCharBorderColor ?? DEFAULT_PREFERENCES.featuredCharBorderColor;
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <RowContainer gap="0.25rem">
      {characters.map((character, index) => (
        <ColumnContainer key={character.id} style={{alignItems: "center", position: "relative"}} gap="0.25rem">
          <img
            style={{...featuredImageStyle, border: index === 0 ? `1px solid ${featuredCharacterBorderColor}` : "1px solid transparent"}}
            src={character.imageUrl!}
            width={32}
            height={32}
          />
          <RowContainer style={{justifyContent: "center"}} gap="0.25rem">
            {textColor === DEFAULT_PREFERENCES.textColor && (
              <img style={{width: "0.75rem", height: "0.75rem", filter: "invert(1)"}} src="https://i.imgur.com/2YTmnEB.png" />
            )}
            <span style={{...textShadowStyle, fontSize: "0.75rem", margin: 0, fontWeight: "bold", color: textColor}}>{character.messages.length}</span>
          </RowContainer>
        </ColumnContainer>
      ))}
    </RowContainer>
  );
}

export function XPBar({progressBarWidth, profilePreferences}: {progressBarWidth: number; profilePreferences?: ProfilePreferences}) {
  const xPBarFillColor = profilePreferences?.xpBarFillColor ?? DEFAULT_PREFERENCES.xpBarFillColor;
  const xPBarBackgroundColor = profilePreferences?.xpBarBackgroundColor ?? DEFAULT_PREFERENCES.xpBarBackgroundColor;
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <div
      style={{
        ...boxShadowStyle,
        backgroundColor: xPBarBackgroundColor,
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
          borderRadius: "6px",
          backgroundColor: xPBarFillColor,
        }}
      />
      <span style={{...textShadowStyle, textTransform: "uppercase", fontSize: "1.25rem", fontWeight: "bold", color: textColor}}>xp</span>
    </div>
  );
}
export function RepBar({reputation, profilePreferences}: {reputation: number; profilePreferences?: ProfilePreferences}) {
  const repBarFillColor = profilePreferences?.repBarColor ?? DEFAULT_PREFERENCES.repBarColor;
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <div style={{...boxShadowStyle, padding: "0.5rem 2rem", borderRadius: "8px", backgroundColor: repBarFillColor, display: "flex"}}>
      <span style={{...textShadowStyle, color: textColor, fontWeight: "bold", fontSize: "1.125rem"}}>+{reputation}rep</span>
    </div>
  );
}
export function StatLine({label, value, profilePreferences}: {label: string; value: string | number; profilePreferences?: ProfilePreferences}) {
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <div style={statsStyle(profilePreferences)}>
      <span style={{color: textColor}}>{label}</span> <span style={{color: textColor}}>{value}</span>
    </div>
  );
}
export function AboutSection({about, profilePreferences}: {about: string | null; profilePreferences?: ProfilePreferences}) {
  const textColor = profilePreferences?.textColor ?? DEFAULT_PREFERENCES.textColor;
  return (
    <RowContainer gap="0.25rem" style={{alignItems: "center"}}>
      <RowContainer style={aboutStyle(profilePreferences)} gap="0.15rem">
        {textColor === DEFAULT_PREFERENCES.textColor && (
          <img style={{width: "2rem", height: "2rem", filter: "invert(1)"}} src="https://i.imgur.com/ESA6hxu.png" />
        )}
        <span style={{fontWeight: "bold", color: textColor}}>{ptBr.profile.aboutMe.title}</span>
      </RowContainer>
      <p
        style={{
          ...textShadowStyle,
          color: textColor,
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
