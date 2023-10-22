import {ProfilePreferences} from "@prisma/client";
import React from "react";

type ProfilePreferencesAssets = Omit<ProfilePreferences, "id" | "about" | "userId">;

export const DEFAULT_PREFERENCES = {
  xpBarFillColor: "#CFB3CD",
  xpBarBackgroundColor: "#888098",
  textColor: "white",
  repBarColor: "#C9DDFF",
  featuredCharBorderColor: "#F7B32B",
  backgroundUrl: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
} satisfies ProfilePreferencesAssets;

export const mainStyle = (preferences: ProfilePreferencesAssets = DEFAULT_PREFERENCES, backgroundUrl?: string | null) =>
  ({
    display: "flex",
    padding: "1rem",
    flexDirection: "column",
    borderRadius: "8px",
    rowGap: "1rem",
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : preferences.backgroundUrl,
    alignItems: "flex-start",
  }) as React.CSSProperties;

export const textShadowStyle: React.CSSProperties = {
  filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
};
export const boxShadowStyle: React.CSSProperties = {
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};
export const titleStyle = (preferences: ProfilePreferencesAssets = DEFAULT_PREFERENCES) =>
  ({
    textTransform: "uppercase",
    letterSpacing: "0.5rem",
    margin: 0,
    fontWeight: "bold",
    color: preferences.textColor,
  }) as React.CSSProperties;

export const statsStyle = (preferences: ProfilePreferencesAssets = DEFAULT_PREFERENCES) =>
  ({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "15rem",
    paddingLeft: "2rem",
    color: preferences.textColor,
    fontSize: "1.25rem",
    ...textShadowStyle,
  }) as React.CSSProperties;

export const aboutStyle = (preferences: ProfilePreferencesAssets = DEFAULT_PREFERENCES) =>
  ({
    alignItems: "center",
    textTransform: "uppercase",
    color: preferences.textColor,
    fontSize: "1.25rem",
    ...textShadowStyle,
  }) as React.CSSProperties;

export const featuredImageStyle = {
  ...boxShadowStyle,
  objectFit: "cover",
  objectPosition: "top",
  borderRadius: "8px",
} as React.CSSProperties;
