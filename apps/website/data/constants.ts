import ptBr from "translations";

export const INFO_BOX_FIELDS = ["gender", "weight", "height", "age", "userId"] as const;

export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${
  import.meta.env.VITE_DISCORD_CLIENT_ID
}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_WEBSITE_BASE_URL + "/login")}&response_type=code&scope=identify`;

export const SELECT_FIELDS = ["race", "faction", "instrument"] as const;

export const TEXT_AREA_FIELDS = ["personality", "appearance", "backstory"] as const;

export const WIKI_CHARACTER_FIELDS = ["personality", "appearance", "backstory"] as const;

export const WIKI_CHARACTER_DETAILS_FIELDS = {
  characteristics: ["gender", "age", "weight", "height", "race"],
  affiliations: ["surname", "faction", "marriedTo"],
} as const;
export type NavbarProps = {name: string; path: string; protected: boolean; children?: Record<string, NavbarProps>};
export const NAVBAR_DATA: Record<string, NavbarProps> = {
  home: {name: ptBr.routes.home, protected: false, path: "/"},
  characters: {name: ptBr.routes.characters, protected: true, path: "/characters"},
  wiki: {
    path: "/wiki",
    name: ptBr.routes.wiki,
    protected: false,
    children: {characters: {name: ptBr.routes.wikiCharacters, protected: false, path: "/wiki/characters"}},
  },
};
