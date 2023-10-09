import {Pagination} from "@discordx/pagination";
import {Prisma} from "@prisma/client";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  channelMention,
} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import ptBr from "translations";
import {MUDAE_IMAGE_HEIGHT, MUDAE_IMAGE_WIDTH, PAGINATION_DEFAULT_OPTIONS} from "../data/constants";
import {prisma} from "../db";
import {changeImageResolution} from "../lib/util/helpers";

type CharacterWithInstrumentsFactionsMessages = Prisma.CharacterGetPayload<{
  include: {instruments: {include: {instrument: true}}; faction: true; messages: {orderBy: {id: "desc"}}};
}>;

const displayCharacterProfileButtonIdPrefix = "displayCharacterProfileButtonId_";
const displayCharacterProfileButtonId = (characterId: number) => displayCharacterProfileButtonIdPrefix + characterId;

@Discord()
export class Character {
  @Slash({
    name: "list-characters",
    description: "List all of a player's characters.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.charactersList.description},
    nameLocalizations: {"pt-BR": ptBr.commands.charactersList.name},
  })
  async listCharacters(
    @SlashOption({
      name: "user",
      required: false,
      description: "The user to display the characters.",
      type: ApplicationCommandOptionType.User,
      nameLocalizations: {"pt-BR": ptBr.commands.charactersList.options.user.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.charactersList.options.user.description},
    })
    member: GuildMember | null = null,
    interaction: ChatInputCommandInteraction,
  ) {
    if (!member && interaction.inCachedGuild()) {
      member = interaction.member;
    }

    try {
      await interaction.deferReply();

      const characters = await prisma.character.findMany({
        where: {userId: member!.id},
        orderBy: {id: "asc"},
        include: {faction: true, instruments: {include: {instrument: true}}, messages: {orderBy: {id: "desc"}}},
      });
      if (characters.length === 0) {
        interaction.editReply(ptBr.errors.noCharacters);
        return;
      }

      const generatePages = async (characters: CharacterWithInstrumentsFactionsMessages[]) => {
        const pages = [];
        for (const character of characters) {
          const messagePayload = await this.makeProfileComponent(character, member!, characters.indexOf(character) + 1, characters.length);
          pages.push(messagePayload);
        }
        return pages;
      };

      const pagination = new Pagination(interaction, await generatePages(characters), {
        ...PAGINATION_DEFAULT_OPTIONS,
        onTimeout: () => interaction.deleteReply().catch((error) => "Error deleting pagination reply: " + error),
      });

      const sentPagination = await pagination.send();

      sentPagination.collector.on("collect", async (interaction) => {
        if (!interaction.customId.startsWith(displayCharacterProfileButtonIdPrefix)) return;
        try {
          const characterId = parseInt(interaction.customId.split("_")[1]);
          const character = await prisma.character.findUnique({
            where: {id: characterId, AND: {userId: member!.id}},
            include: {race: true, faction: true, instruments: {include: {instrument: true}}, messages: {orderBy: {id: "desc"}}},
          });
          const embed = new EmbedBuilder()
            .setDescription(character?.backstory ?? null)
            .setColor((sentPagination.message.embeds[0].hexColor as ColorResolvable) ?? "Random")
            .setFields([
              {name: ptBr.character.personality, value: character?.personality ?? "Nenhuma"},
              {name: ptBr.character.appearance, value: character?.appearance ?? "Nenhuma"},
              {name: ptBr.character.race, value: character?.race?.name ?? "Nenhuma", inline: true},
              {name: ptBr.character.age, value: character?.age ?? "Nenhuma", inline: true},
              {name: ptBr.character.height, value: character?.height ?? "Nenhuma", inline: true},
              {name: ptBr.character.weight, value: character?.weight ?? "Nenhuma", inline: true},
              {name: ptBr.character.imageUrl, value: character?.imageUrl ?? "Nenhuma", inline: true},
            ]);

          interaction.reply({ephemeral: true, embeds: [embed]}).catch((error) => "Error sending character detailed profile: " + error);
        } catch (error) {
          console.log("Error displaying character profile:", error);
          interaction.reply({ephemeral: true, content: ptBr.errors.somethingWentWrong}).catch((error) => "Error sending error feedback: " + error);
        }
      });
    } catch (listCharactersErrors) {
      console.log("Error listing characters:", listCharactersErrors);
      interaction.editReply(ptBr.errors.listCharacters).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "set-character",
    description: "Set a character to play.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.setCharacter.description},
    nameLocalizations: {"pt-BR": ptBr.commands.setCharacter.name},
  })
  async setCharacter(
    @SlashOption({
      name: "character",
      description: "The character to set.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.setCharacter.options.character.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.setCharacter.options.character.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: async (interaction) => {
        const characters = await prisma.character
          .findMany({
            take: 10,
            select: {id: true, name: true},
            where: {userId: interaction.user.id, AND: {name: {contains: interaction.options.getFocused()}}},
          })
          .catch((error) => console.log("Error fetching character list:", error));
        if (!characters) return;
        await interaction
          .respond(characters.map((character) => ({name: character.name!, value: character.id})))
          .catch((error) => console.log("Error sending character list:", error));
      },
    })
    characterId: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});

      await prisma.character.updateMany({where: {userId: interaction.user.id}, data: {isBeingUsed: false}});
      const setCharacter = await prisma.character.update({where: {id: characterId}, data: {isBeingUsed: true}, include: {faction: {select: {emoji: true}}}});

      await interaction.editReply(
        ptBr.feedback.setCharacter.submitted
          .replace("{name}", `${setCharacter.name} ${setCharacter.surname}`)
          .replace("{factionEmoji}", setCharacter.faction?.emoji || ""),
      );
    } catch (setCharacterErrors) {
      console.log("Error setting character:", setCharacterErrors);
      interaction.editReply(ptBr.errors.setCharacter).catch((error) => "Error sending error feedback: " + error);
    }
  }

  private async makeProfileComponent(character: CharacterWithInstrumentsFactionsMessages, member: GuildMember, currentIndex: number, characterCount: number) {
    const messagePayload: BaseMessageOptions = {};

    const displayEmbed = new EmbedBuilder()
      .setAuthor({name: member.user.username, iconURL: member.displayAvatarURL()})
      .setFooter({
        text: ptBr.embeds.characterList.footer.replace("{currentIndex}", currentIndex.toString()).replace("{characterCount}", characterCount.toString()),
      })
      .setColor("Random");
    if (character.faction) displayEmbed.addFields([{name: ptBr.character.faction, value: `${character.faction?.emoji} ${character.faction?.name}`}]);

    if (character.instruments.length)
      displayEmbed.addFields([
        {
          name: ptBr.character.instruments,
          value: character.instruments
            .map((instrument) => `- ${instrument.instrument?.name}`)
            .slice(0, 5)
            .join("\n"),
        },
      ]);

    const channelId = character.messages.at(0)?.channelId;
    if (channelId) displayEmbed.addFields([{name: ptBr.character.lastSeen, value: channelMention(channelId)}]);

    if (character.imageUrl) {
      const fileName = "character.png";
      const attachment = new AttachmentBuilder(await changeImageResolution(character.imageUrl, MUDAE_IMAGE_WIDTH, MUDAE_IMAGE_HEIGHT)).setName(fileName);
      messagePayload.files = [attachment];
      displayEmbed.setImage("attachment://" + fileName);
    }

    if (character.name) {
      displayEmbed.setTitle(`${character.name} ${character.surname}`);
    }

    messagePayload.embeds = [displayEmbed];
    messagePayload.components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(displayCharacterProfileButtonId(character.id))
          .setLabel(ptBr.buttons.displayCharacterProfile)
          .setStyle(ButtonStyle.Primary),
      ),
    ];
    return messagePayload;
  }
}
