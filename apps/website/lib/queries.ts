import {Character, Prisma, User} from "@prisma/client";
import lodash from "lodash";

async function fetchData<T>(endpointOrFullURL: string, params?: Record<string, string | undefined>) {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const url = endpointOrFullURL.startsWith("http") ? new URL(endpointOrFullURL) : new URL(`${baseURL}${endpointOrFullURL}`);
  if (params) for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value ?? "");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Network response was not ok");

  return (await response.json()) as T;
}

export const userQuery = () => ({
  queryKey: "user",
  queryFn: () => fetchData("/discord/check") as Promise<User>,
});

export const widgetQuery = () => ({
  queryKey: ["widget"],
  queryFn: () => fetchData<WidgetData>("https://discord.com/api/guilds/1149824330507767869/widget.json"),
});

type WikiQueryProps = {
  page?: number;
  pageSize?: number;
  expanded?: boolean;
};

export const wikiCharactersQuery = <T extends WikiCharacterLink[] | WikiCharacter[]>(props?: WikiQueryProps) => ({
  queryKey: ["wiki-characters", props?.page, props?.pageSize],
  queryFn: () =>
    fetchData<WikiCharactersResponse<T>>("/wiki/characters", {
      page: props?.page?.toString(),
      pageSize: props?.pageSize?.toString(),
      expanded: props?.expanded?.toString(),
    }),
});

export const wikiCharacterQuery = (characterName: string) => ({
  queryKey: ["wiki-character", characterName],
  queryFn: () => fetchData<WikiCharacter>(`/wiki/characters/${lodash.kebabCase(characterName)}`),
});

export const announcementsQuery = () => ({
  queryKey: ["announcements"],
  queryFn: () => fetchData<Announcement[]>("/wiki/announcements"),
});

export const charactersQuery = (q?: string | null) => ({
  queryKey: "characters",
  queryFn: () => fetchData<Character[]>("/characters", q ? {q} : undefined),
});

export const characterQuery = (characterId?: number) => ({
  queryKey: ["character", characterId],
  queryFn: () => fetchData<Character>(`/characters/${characterId}`),
});

// Type definitions
export type WidgetData = {
  id: string;
  name: string;
  instant_invite: string;
  channels: Channel[];
  members: Member[];
  presence_count: number;
};

type Member = {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  status: "online" | "offline" | "idle" | "dnd";
  avatar_url: string;
};

type Channel = {
  id: string;
  name: string;
  position: number;
};

export type Announcement = {
  content: string;
  attachments?: string[];
};

export type WikiCharacterLink = Prisma.CharacterGetPayload<{select: {name: true; id: true; imageUrl: true}}> & {
  link: string;
  name: string;
  imageUrl: string;
};

export type WikiCharactersResponse<T extends WikiCharacterLink[] | WikiCharacter[]> = {characters: T; totalPages: number};

export type WikiCharacter = Prisma.CharacterGetPayload<{include: {faction: true; instruments: true; race: true}}>;
