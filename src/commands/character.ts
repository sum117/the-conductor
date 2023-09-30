import {Pagination, PaginationType} from "@discordx/pagination";
import {Prisma} from "@prisma/client";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
  channelMention,
} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import {Duration} from "luxon";
import sharp from "sharp";
import {prisma} from "../db";
import {ptBr} from "../translations/ptBr";

type CharacterWithInstrumentsFactionsMessages = Prisma.CharacterGetPayload<{
  include: {instruments: {include: {instrument: true}}; faction: true; messages: {orderBy: {id: "desc"}}};
}>;

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
    user: User | null = null,
    interaction: ChatInputCommandInteraction,
  ) {
    if (!user) {
      user = interaction.user;
    }

    try {
      await interaction.deferReply();

      const characters = await prisma.character.findMany({
        where: {userId: user.id},
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
          const messagePayload = await this.makeProfileComponent(character, user!, characters.indexOf(character) + 1, characters.length);
          pages.push(messagePayload);
        }
        return pages;
      };

      const pagination = new Pagination(interaction, await generatePages(characters), {
        type: PaginationType.Button,
        filter: (interaction) => interaction.user.id === user?.id,
        end: {emoji: {name: "⏩"}, label: ptBr.pagination.end, style: ButtonStyle.Secondary},
        start: {emoji: {name: "⏪"}, label: ptBr.pagination.start, style: ButtonStyle.Primary},
        next: {emoji: {name: "▶️"}, label: ptBr.pagination.next, style: ButtonStyle.Primary},
        previous: {emoji: {name: "◀️"}, label: ptBr.pagination.previous, style: ButtonStyle.Secondary},
        enableExit: false,
        time: Duration.fromObject({minutes: 20}).as("milliseconds"),
        onTimeout: () => interaction.deleteReply().catch((error) => "Error deleting pagination reply: " + error),
      });

      await pagination.send();
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
        const characters = await prisma.character.findMany({
          take: 10,
          select: {id: true, name: true},
          where: {userId: interaction.user.id, AND: {name: {contains: interaction.options.getFocused()}}},
        });
        await interaction.respond(characters.map((character) => ({name: character.name!, value: character.id})));
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

  private async makeProfileComponent(character: CharacterWithInstrumentsFactionsMessages, user: User, currentIndex: number, characterCount: number) {
    const mudaeImageWidth = 225;
    const mudaeImageHeight = 350;

    const messagePayload: BaseMessageOptions = {};

    const displayEmbed = new EmbedBuilder()
      .setAuthor({name: user.username, iconURL: user.displayAvatarURL()})
      .setFooter({
        text: ptBr.embeds.characterList.footer.replace("{currentIndex}", currentIndex.toString()).replace("{characterCount}", characterCount.toString()),
      })
      .setFields([{name: ptBr.character.faction, value: `${character.faction?.emoji} ${character.faction?.name}` || "Nenhuma"}])
      .setColor("Random");

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
      const attachment = new AttachmentBuilder(await this.changeImageResolution(character.imageUrl, mudaeImageWidth, mudaeImageHeight)).setName(fileName);
      messagePayload.files = [attachment];
      displayEmbed.setImage("attachment://" + fileName);
    }

    if (character.name) {
      displayEmbed.setTitle(`${character.name} ${character.surname}`);
    }

    messagePayload.embeds = [displayEmbed];

    return messagePayload;
  }

  private async changeImageResolution(imageUrl: string, width: number, height: number) {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    const resizedBuffer = await sharp(buffer).resize({width: width, height: height, fit: "cover", position: "top"}).png().toBuffer();

    return resizedBuffer;
  }
}
