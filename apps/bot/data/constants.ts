import {PaginationType} from "@discordx/pagination";
import {ButtonStyle} from "discord.js";
import {Duration} from "luxon";
import ptBr from "translations";

export const WIKI_CHARACTER_DETAILS_FIELDS = {
  characteristics: ["gender", "age", "weight", "height", "race"],
  affiliations: ["surname", "faction"],
} as const;

export const NPC_RARITY = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
};

export const PAGINATION_DEFAULT_OPTIONS = {
  type: PaginationType.Button,
  end: {emoji: {name: "⏩"}, label: ptBr.pagination.end, style: ButtonStyle.Secondary},
  start: {emoji: {name: "⏪"}, label: ptBr.pagination.start, style: ButtonStyle.Primary},
  next: {emoji: {name: "▶️"}, label: ptBr.pagination.next, style: ButtonStyle.Primary},
  previous: {emoji: {name: "◀️"}, label: ptBr.pagination.previous, style: ButtonStyle.Secondary},
  enableExit: false,
  time: Duration.fromObject({minutes: 20}).as("milliseconds"),
};

export const MUDAE_IMAGE_WIDTH = 225;
export const MUDAE_IMAGE_HEIGHT = 350;
