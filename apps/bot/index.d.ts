import "@total-typescript/ts-reset";
declare module "bun" {
  interface Env {
    BOT_TOKEN: string;
    DATABASE_URL: string;
    DATABASE_PROXY_URL: string;
    DISCORD_API_ENDPOINT: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    WEBSITE_BASE_URL: string;
    API_BASE_URL: string;
  }
}

declare module "*.ttf";
