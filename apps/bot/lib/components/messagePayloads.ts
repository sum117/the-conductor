import {Channel} from "@prisma/client";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, MessageCreateOptions, MessageFlagsBitField} from "discord.js";
import ptBr from "translations";

export const dismissButtonCustomId = "dismissButtonCustomId";

export function makeRoleplayingPlaceholderPayload(channel: GuildTextBasedChannel, channelPrismaData: Channel): MessageCreateOptions {
  return {
    flags: [MessageFlagsBitField.Flags.SuppressNotifications],
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: channel.guild.name,
          iconURL: channel.guild.iconURL({extension: "png", size: 128}) ?? undefined,
        })
        .setColor("Random")
        .setDescription(channelPrismaData.description ?? ptBr.embeds.noDescriptionProvided)
        .setImage(channelPrismaData.imageUrl ?? null)
        .setTitle(channelPrismaData.name),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(dismissButtonCustomId).setStyle(ButtonStyle.Danger).setLabel(ptBr.buttons.dismiss).setEmoji("🗑️"),
      ),
    ],
  };
}
