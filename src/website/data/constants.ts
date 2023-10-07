export const INFO_BOX_FIELDS = ["gender", "weight", "height", "age", "userId"] as const;

export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  Bun.env.WEBSITE_BASE_URL,
)}&response_type=code&scope=identify`;

export const SELECT_FIELDS = ["race", "faction"] as const;

export const TEXT_AREA_FIELDS = ["personality", "appearance", "backstory"] as const;
