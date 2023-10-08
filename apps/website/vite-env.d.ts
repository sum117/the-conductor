/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSITE_BASE_URL: string;
  readonly VITE_DISCORD_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
