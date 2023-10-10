import {Channel, Prisma} from "@prisma/client";
import {ApplicationCommandOptionType, ChatInputCommandInteraction, GuildTextBasedChannel, PermissionFlagsBits} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import ptBr from "translations";
import {credentials, getSafeKeys} from "utilities";
import {prisma} from "../db";
import {makeRoleplayingPlaceholderPayload} from "../lib/components/messagePayloads";
import {rpChannelEditorFields, rpChannelEditorModal} from "../lib/components/modals";
import {awaitSubmitModal, getSanitizedChannelName} from "../lib/util/helpers";

@Discord()
export class ChannelEditor {
  @Slash({
    description: "Edits a roleplaying channel with new settings",
    name: "edit-rp-channel",
    descriptionLocalizations: {"pt-BR": ptBr.commands.editRpChannel.description},
    nameLocalizations: {"pt-BR": ptBr.commands.editRpChannel.name},
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  })
  async editRpChannel(
    @SlashOption({
      name: "channel",
      description: "The channel to edit",
      descriptionLocalizations: {"pt-BR": ptBr.commands.editRpChannel.options.channel.description},
      nameLocalizations: {"pt-BR": ptBr.commands.editRpChannel.options.channel.name},
      type: ApplicationCommandOptionType.Channel,
      required: true,
    })
    channel: GuildTextBasedChannel,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      if (!this.isEditableChannel(channel)) {
        await interaction.reply({content: ptBr.feedback.notAnEditableChannel, ephemeral: true});
        return;
      }

      const sanitizedChannelName = getSanitizedChannelName(channel);
      const channelData = await this.getChannelDataOrCreate(channel, sanitizedChannelName);
      if (!channelData) {
        await interaction.reply({content: ptBr.feedback.channelNotFound, ephemeral: true});
        return;
      }

      await interaction.showModal(rpChannelEditorModal(channelData));

      const updatedChannel = await this.processSubmittedModal(interaction, channel);
      if (!updatedChannel) {
        await interaction.reply({content: ptBr.errors.updatingChannel});
        return;
      }

      await this.updateOrSendPlaceholderMessage(updatedChannel, channel);
    } catch (error) {
      console.error("Error editing roleplaying channel:", error);
      await interaction.reply({content: ptBr.errors.editingChannel, ephemeral: true}).catch(console.error);
    }
  }

  private isEditableChannel(channel: GuildTextBasedChannel): boolean {
    return channel.isTextBased() && (channel.parent?.name.startsWith("RP") || credentials.channels.randomRoleplay === channel.id);
  }

  private async getChannelDataOrCreate(channel: GuildTextBasedChannel, name: string): Promise<Channel | null> {
    return (
      (await prisma.channel.findUnique({where: {id: channel.id}})) ?? (await prisma.channel.create({data: {id: channel.id, name: name}}).catch(() => null))
    );
  }

  private async processSubmittedModal(interaction: ChatInputCommandInteraction, channel: GuildTextBasedChannel): Promise<Channel | null> {
    const submitted = await awaitSubmitModal(interaction);
    const fields = getSafeKeys(rpChannelEditorFields).reduce(
      (accumulator, key) => {
        const value = submitted.fields.getTextInputValue(key);
        if (value) accumulator[key] = value;
        return accumulator;
      },
      <Prisma.ChannelUpdateInput>{},
    );
    await submitted.deleteReply().catch((error) => console.error("Error deleting reply", error));
    return await prisma.channel.update({where: {id: channel.id}, data: fields}).catch((error) => {
      console.error("Error updating channel", error);
      return null;
    });
  }

  private async updateOrSendPlaceholderMessage(updatedChannel: Channel, channel: GuildTextBasedChannel) {
    const placeholderMessage = updatedChannel.placeholderMessageId ? await channel.messages.fetch(updatedChannel.placeholderMessageId).catch(() => null) : null;

    if (placeholderMessage) await placeholderMessage.edit({...makeRoleplayingPlaceholderPayload(channel, updatedChannel), flags: []});
    else {
      const newPlaceholderMessage = await channel.send(makeRoleplayingPlaceholderPayload(channel, updatedChannel));
      await prisma.channel
        .update({where: {id: updatedChannel.id}, data: {placeholderMessageId: newPlaceholderMessage.id}})
        .catch((error) => console.error("Error updating channel", error));
    }
  }
}
