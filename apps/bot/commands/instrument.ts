import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, PermissionFlagsBits, userMention} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import ptBr from "translations";
import {prisma} from "../db";
import {makeInstrumentEmbed} from "../lib/components/instrumentEmbed";

const getInstrumentAutocomplete = async (interaction: AutocompleteInteraction) => {
  try {
    const instruments = await prisma.instrument.findMany({
      select: {id: true, name: true},
      where: {name: {contains: interaction.options.getFocused().toLowerCase()}},
      take: 10,
    });
    if (!instruments.length) return;
    interaction
      .respond(instruments.map((instrument) => ({name: instrument.name!, value: instrument.id})))
      .catch((error) => console.log("Error sending instrument list:", error));
  } catch (error) {
    console.log("Error fetching instrument list:", error);
  }
};

@Discord()
export class Instrument {
  @Slash({
    name: "assign-instrument",
    description: "Assigns an instrument to a character",
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    descriptionLocalizations: {"pt-BR": ptBr.commands.assignInstrument.description},
    nameLocalizations: {"pt-BR": ptBr.commands.assignInstrument.name},
  })
  async assignInstrument(
    @SlashOption({
      name: "character",
      description: "The character to assign the instrument to",
      descriptionLocalizations: {"pt-BR": ptBr.commands.assignInstrument.options.character.description},
      nameLocalizations: {"pt-BR": ptBr.commands.assignInstrument.options.character.name},
      type: ApplicationCommandOptionType.Integer,
      autocomplete: async (interaction) => {
        try {
          const characters = await prisma.character.findMany({
            select: {id: true, name: true},
            where: {name: {contains: interaction.options.getFocused().toLowerCase()}},
            take: 10,
          });
          if (!characters.length) return;
          interaction
            .respond(characters.map((character) => ({name: character.name!, value: character.id})))
            .catch((error) => console.log("Error sending character list:", error));
        } catch (error) {
          console.log("Error fetching character list:", error);
        }
      },
    })
    characterId: number,
    @SlashOption({
      name: "instrument",
      description: "The instrument to assign to the character",
      descriptionLocalizations: {"pt-BR": ptBr.commands.assignInstrument.options.instrument.description},
      nameLocalizations: {"pt-BR": ptBr.commands.assignInstrument.options.instrument.name},
      type: ApplicationCommandOptionType.Integer,
      autocomplete: getInstrumentAutocomplete,
    })
    instrumentId: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});

      const character = await prisma.character.findUnique({where: {id: characterId}});
      const instrument = await prisma.instrument.findUnique({where: {id: instrumentId}});

      if (!character || !instrument) {
        interaction.editReply(ptBr.errors.assignInstrument).catch((error) => "Error sending error feedback: " + error);
        return;
      }

      await prisma.instrumentCharacter.upsert({
        create: {characterId, instrumentId, quantity: 1},
        update: {characterId, instrumentId, quantity: {increment: 1}},
        where: {unique_character_instrument: {characterId, instrumentId}},
      });

      await interaction.editReply({
        embeds: [makeInstrumentEmbed(instrument)],
        content: ptBr.feedback.assignInstrument.submitted.replace("{character}", character.name ?? ptBr.none).replace("{user}", userMention(character.userId)),
      });
    } catch (assignInstrumentErrors) {
      console.log("Error assigning instrument:", assignInstrumentErrors);
      interaction.editReply(ptBr.errors.somethingWentWrong).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "delete-instrument",
    description: "Deletes an instrument",
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    descriptionLocalizations: {"pt-BR": ptBr.commands.deleteInstrument.description},
    nameLocalizations: {"pt-BR": ptBr.commands.deleteInstrument.name},
  })
  async deleteInstrument(
    @SlashOption({
      name: "instrument",
      description: "The instrument to delete",
      descriptionLocalizations: {"pt-BR": ptBr.commands.deleteInstrument.options.instrument.description},
      nameLocalizations: {"pt-BR": ptBr.commands.deleteInstrument.options.instrument.name},
      autocomplete: getInstrumentAutocomplete,
      type: ApplicationCommandOptionType.Integer,
    })
    instrumentId: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});
      const deletedInstrument = await prisma.instrument.delete({where: {id: instrumentId}});

      await interaction.editReply(ptBr.feedback.deleteInstrument.submitted.replace("{instrument}", deletedInstrument.name));
    } catch (deleteInstrumentErrors) {
      interaction.editReply(ptBr.errors.somethingWentWrong).catch((error) => "Error sending error feedback: " + error);
      console.log("Error deleting instrument:", deleteInstrumentErrors);
    }
  }
}
