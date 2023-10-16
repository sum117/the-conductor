import {Instrument} from "@prisma/client";
import {EmbedBuilder} from "discord.js";
import ptBr from "translations";

export function makeInstrumentEmbed(instrument: Instrument) {
  const embed = new EmbedBuilder()
    .setTitle(instrument.name)
    .setDescription(instrument.description)
    .setThumbnail(instrument.imageUrl)
    .setColor("Random")
    .setFields([{name: ptBr.embeds.beginnerInstrument, value: instrument.isBeginner ? "✅" : "❌"}]);

  return embed;
}
