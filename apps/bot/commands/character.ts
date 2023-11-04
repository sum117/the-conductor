import {Pagination} from "@discordx/pagination";
import {Prisma} from "@prisma/client";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  AutocompleteInteraction,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  GuildMember,
  channelMention,
  userMention,
} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import ptBr from "translations";
import {MUDAE_IMAGE_HEIGHT, MUDAE_IMAGE_WIDTH, PAGINATION_DEFAULT_OPTIONS} from "../data/constants";
import {prisma} from "../db";
import {changeImageResolution} from "../lib/util/helpers";
import sharp from "sharp";
import {imageLinks} from "../data/assets";
import {Duration} from "luxon";

type CharacterWithInstrumentsFactionsMessages = Prisma.CharacterGetPayload<{
  include: {instruments: {include: {instrument: true}}; faction: true; messages: {orderBy: {id: "desc"}}};
}>;

const displayCharacterProfileButtonIdPrefix = "displayCharacterProfileButtonId_";
const displayCharacterProfileButtonId = (characterId: number) => displayCharacterProfileButtonIdPrefix + characterId;
const marriageProposalButtonAcceptId = "marriageProposalButtonAcceptId";
const marriageProposalButtonDeclineId = "marriageProposalButtonDeclineId";

function getCharacterAutoComplete({onlyUserCharacters = false}) {
  return async (interaction: AutocompleteInteraction) => {
    const where = onlyUserCharacters ? {OR: [{userId: interaction.user.id}, {marriedTo: {some: {userId: interaction.user.id}}}]} : {};
    const characters = await prisma.character
      .findMany({
        take: 10,
        select: {id: true, name: true},
        where: {
          ...where,
          AND: {name: {contains: interaction.options.getFocused()}},
        },
      })
      .catch((error) => console.log("Error fetching character list:", error));
    if (!characters) return;
    await interaction
      .respond(characters.map((character) => ({name: character.name!, value: character.id})))
      .catch((error) => console.log("Error sending character list:", error));
  };
}

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
              {name: ptBr.character.personality, value: character?.personality ?? ptBr.noneF},
              {name: ptBr.character.appearance, value: character?.appearance ?? ptBr.noneF},
              {name: ptBr.character.race, value: character?.race?.name ?? ptBr.noneF, inline: true},
              {name: ptBr.character.age, value: character?.age ?? ptBr.noneF, inline: true},
              {name: ptBr.character.height, value: character?.height ?? ptBr.noneF, inline: true},
              {name: ptBr.character.weight, value: character?.weight ?? ptBr.noneF, inline: true},
              {name: ptBr.character.imageUrl, value: character?.imageUrl ?? ptBr.noneF, inline: true},
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
      autocomplete: getCharacterAutoComplete({onlyUserCharacters: true}),
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

  @Slash({
    name: "marry-character",
    description: "Marry a character.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.marryCharacter.description},
    nameLocalizations: {"pt-BR": ptBr.commands.marryCharacter.name},
  })
  async marryCharacter(
    @SlashOption({
      name: "character",
      description: "The character to marry.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.marryCharacter.options.character.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.marryCharacter.options.character.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getCharacterAutoComplete({onlyUserCharacters: true}),
    })
    characterId: number,
    @SlashOption({
      name: "target_character",
      description: "The character to send the marriage proposal.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.marryCharacter.options.characterProposal.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.marryCharacter.options.characterProposal.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getCharacterAutoComplete({onlyUserCharacters: false}),
    })
    characterProposalId: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});
      if (!interaction.channel?.isTextBased()) {
        interaction.editReply(ptBr.errors.invalidChannelType).catch((error) => "Error sending error feedback: " + error);
        return;
      }

      const [character, targetCharacter] = await Promise.all([
        prisma.character.findUnique({where: {id: characterId}, include: {user: true, marriedTo: true}}),
        prisma.character.findUnique({where: {id: characterProposalId}, include: {user: true}}),
      ]);
      const isAlreadyMarriedWithTarget = character?.marriedTo.find((marriedTo) => marriedTo.id === targetCharacter?.id);
      if (isAlreadyMarriedWithTarget) {
        interaction.editReply(ptBr.errors.charactersAlreadyMarried).catch((error) => "Error sending error feedback: " + error);
        return;
      }

      if (!character?.imageUrl || !targetCharacter?.imageUrl) {
        interaction.editReply(ptBr.errors.characterNotFound).catch((error) => "Error sending error feedback: " + error);
        return;
      }

      const banner = await this.makeMarriageRequestBanner(character.imageUrl, targetCharacter.imageUrl);

      const marriageProposalEmbed = new EmbedBuilder()
        .setTitle(ptBr.embeds.marriageProposal.title.replace("{character}", character.name!).replace("{targetCharacter}", targetCharacter.name!))
        .setDescription(
          ptBr.embeds.marriageProposal.description
            .replaceAll("{user}", interaction.user.toString())
            .replaceAll("{character}", character.name!)
            .replaceAll("{targetCharacter}", targetCharacter.name!)
            .replaceAll("{targetUser}", userMention(targetCharacter.user?.id)),
        )
        .setColor(Colors.DarkRed)
        .setFooter({text: ptBr.embeds.marriageProposal.footerText})
        .setImage("attachment://marriage.png");

      const marriageProposalButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(marriageProposalButtonAcceptId).setLabel(ptBr.buttons.accept).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(marriageProposalButtonDeclineId).setLabel(ptBr.buttons.decline).setStyle(ButtonStyle.Danger),
      );

      const marriageProposalMessage = await interaction.channel.send({
        content: userMention(targetCharacter.user?.id),
        embeds: [marriageProposalEmbed],
        components: [marriageProposalButtonRow],
        files: [new AttachmentBuilder(banner).setName("marriage.png")],
      });

      interaction
        .editReply(ptBr.feedback.marriageProposal.sent.replace("{targetUser}", userMention(targetCharacter.user?.id)))
        .catch((error) => "Error sending error feedback: " + error);

      const collector = marriageProposalMessage.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === targetCharacter.user?.id,
        max: 1,
        time: Duration.fromObject({minutes: 10}).as("milliseconds"),
      });

      const handleMarriageProposalButton = async (marriageButtonInteraction: ButtonInteraction) => {
        await marriageButtonInteraction.deferUpdate();
        switch (marriageButtonInteraction.customId) {
          case marriageProposalButtonAcceptId:
            await marriageButtonInteraction.editReply({
              content: ptBr.feedback.marriageProposal.accepted
                .replaceAll("{user}", interaction.user.toString())
                .replaceAll("{character}", character.name!)
                .replaceAll("{targetCharacter}", targetCharacter.name!)
                .replaceAll("{targetUser}", userMention(targetCharacter.user?.id)),
              embeds: [],
              components: [],
            });
            await prisma.character.update({where: {id: character.id}, data: {marriedTo: {connect: {id: targetCharacter.id}}}});
            await prisma.character.update({where: {id: targetCharacter.id}, data: {marriedTo: {connect: {id: character.id}}}});
            break;
          case marriageProposalButtonDeclineId:
            await marriageButtonInteraction.editReply({
              content: ptBr.feedback.marriageProposal.rejected
                .replaceAll("{user}", interaction.user.toString())
                .replaceAll("{character}", character.name!)
                .replaceAll("{targetCharacter}", targetCharacter.name!)
                .replaceAll("{targetUser}", userMention(targetCharacter.user?.id)),
              embeds: [],
              components: [],
            });
            break;
        }
      };

      collector.on("collect", async (collectorInteraction) =>
        handleMarriageProposalButton(collectorInteraction).catch((error) => console.log("Error handling marriage proposal button:", error)),
      );
    } catch (error) {
      console.log("Error marrying character:", error);
      interaction.editReply(ptBr.errors.marryCharacter).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "divorce-character",
    description: "Divorce a character.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.description},
    nameLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.name},
  })
  async divorceCharacter(
    @SlashOption({
      name: "character",
      description: "The character to divorce.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.options.character.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.options.character.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getCharacterAutoComplete({onlyUserCharacters: true}),
    })
    characterId: number,
    @SlashOption({
      name: "target_character",
      description: "The target character to divorce from.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.options.characterProposal.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.divorceCharacter.options.characterProposal.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getCharacterAutoComplete({onlyUserCharacters: true}),
    })
    targetCharacterId: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});

      const [character, targetCharacter] = await Promise.all([
        prisma.character.findUnique({where: {id: characterId}, include: {marriedTo: true}}),
        prisma.character.findUnique({where: {id: targetCharacterId}, include: {marriedTo: true}}),
      ]);
      const isMarriedWithTarget = character?.marriedTo.find((marriedTo) => marriedTo.id === targetCharacter?.id);
      if (!isMarriedWithTarget) {
        interaction.editReply(ptBr.errors.charactersNotMarried).catch((error) => "Error sending error feedback: " + error);
        return;
      }

      await prisma.character.update({where: {id: characterId}, data: {marriedTo: {disconnect: {id: targetCharacterId}}}});
      await prisma.character.update({where: {id: targetCharacterId}, data: {marriedTo: {disconnect: {id: characterId}}}});

      await interaction.editReply(ptBr.feedback.divorceCharacter.submitted);
    } catch (error) {
      console.log("Error divorcing character:", error);
    }
  }

  private async makeMarriageRequestBanner(characterImageUrl: string, targetCharacterImageUrl: string) {
    const [characterImageBuffer, targetCharacterImageBuffer, heartImageBuffer] = await Promise.all([
      changeImageResolution(characterImageUrl, MUDAE_IMAGE_WIDTH, MUDAE_IMAGE_HEIGHT),
      changeImageResolution(targetCharacterImageUrl, MUDAE_IMAGE_WIDTH, MUDAE_IMAGE_HEIGHT),
      changeImageResolution(imageLinks.heartImage, 128, 128, false),
    ]);

    const [metadataCharacterImageBuffer, metadataTargetCharacterImageBuffer] = await Promise.all([
      sharp(characterImageBuffer).metadata(),
      sharp(targetCharacterImageBuffer).metadata(),
    ]);

    const totalWidth = metadataCharacterImageBuffer.width! + metadataTargetCharacterImageBuffer.width!;
    const totalHeight = Math.max(metadataCharacterImageBuffer.height!, metadataTargetCharacterImageBuffer.height!);

    const image = await sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 4,
        background: {r: 0, g: 0, b: 0, alpha: 0},
      },
    })
      .composite([
        {input: characterImageBuffer, left: 0, top: 0},
        {input: targetCharacterImageBuffer, left: metadataCharacterImageBuffer.width!, top: 0},
        {input: heartImageBuffer, gravity: "center"},
      ])
      .png()
      .toBuffer();

    return image;
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
