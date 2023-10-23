import {User} from "@prisma/client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent as ButtonComponentType,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  roleMention,
  userMention,
} from "discord.js";
import {ButtonComponent, Discord, SelectMenuComponent, Slash} from "discordx";
import lodash from "lodash";
import {Duration} from "luxon";
import ptBr from "translations";
import {cleanImageUrl, credentials} from "utilities";
import {imageLinks} from "../data/assets";
import {prisma} from "../db";
import {submissionAppearanceModal, submissionEssentialsModal} from "../lib/components/modals";
import {awaitSubmitModal, getUserLevelDetails} from "../lib/util/helpers";

const createCharacterPopupButtonId = "createCharacter";
const createCharacterEssentialsButtonId = "createCharacterEssentials";
const createCharacterAppearanceButtonId = "createCharacterAppearance";
const createCharacterSendButtonId = "createCharacterSend";
const createCharacterRaceSelectMenuId = "createCharacterRaceSelectMenu";
const createCharacterFactionSelectMenuId = "createCharacterFactionSelectMenu";
const createCharacterInstrumentSelectMenuId = "createCharacterInstrumentSelectMenu";
const createCharacterApproveButtonIdPrefix = "createCharacterApprove-";
const createCharacterRejectButtonIdPrefix = "createCharacterReject-";

const createCharacterApproveButtonId = (characterId: number) => createCharacterApproveButtonIdPrefix + characterId;
const createCharacterRejectButtonId = (characterId: number) => createCharacterRejectButtonIdPrefix + characterId;

export function createCharacterEvaluationButtonRow(characterId: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(createCharacterApproveButtonId(characterId)).setLabel(ptBr.buttons.approve).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(createCharacterRejectButtonId(characterId)).setLabel(ptBr.buttons.reject).setStyle(ButtonStyle.Danger),
  );
}
@Discord()
export class Submission {
  private timeOuts: Map<string, NodeJS.Timeout>;
  constructor() {
    this.timeOuts = new Map();
  }
  // Admin
  @ButtonComponent({
    id: new RegExp(createCharacterApproveButtonIdPrefix + "\\d+"),
  })
  public async buttonCreateCharacterApprove(interaction: ButtonInteraction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.member.roles.cache.has(credentials.roles.adminRole)) return;

    const approvedChannel = interaction.guild?.channels.cache.get(credentials.channels.approvedChannel);
    if (approvedChannel?.type !== ChannelType.GuildText) {
      console.error(`Approved channel is not a text channel: ${approvedChannel?.id}`);
      return;
    }
    const characterId = parseInt(interaction.customId.replace(createCharacterApproveButtonIdPrefix, ""));
    try {
      await interaction.deferReply({ephemeral: true});
      const character = await prisma.character.findUnique({where: {id: characterId}, include: {user: true}});
      if (!character?.userId) {
        console.error(`User for character ${characterId} not found`);
        return;
      }

      const characterOwner = await interaction.guild.members.fetch(character.userId).catch((error) => {
        console.error(`Error fetching character owner: `, error);
        return null;
      });
      if (!characterOwner) return;

      const userLevelDetails = getUserLevelDetails(character.user);
      if (!characterOwner.roles.cache.has(credentials.roles.levels.studentRole) && userLevelDetails.userLevel < 2)
        characterOwner.roles.add(credentials.roles.levels.studentRole);

      const characterEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
      characterEmbed.setFooter(null);
      characterEmbed.setTimestamp(Date.now());

      await approvedChannel.send({
        content: ptBr.feedback.evaluation.approved.replace("{user}", userMention(character?.userId)).replace("{mention}", interaction.user.toString()),
        embeds: [characterEmbed],
      });
      await interaction.editReply({
        content: ptBr.feedback.evaluation.approved.replace("{user}", userMention(character?.userId)).replace("{mention}", interaction.user.toString()),
      });
      await interaction.message.delete().catch((error) => console.error("Error deleting message: ", error));
    } catch (characterApprovalError) {
      console.error("Error approving character: ", characterApprovalError);
    }
  }

  @ButtonComponent({
    id: new RegExp(createCharacterRejectButtonIdPrefix + "\\d+"),
  })
  public async buttonCreateCharacterReject(interaction: ButtonInteraction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.member.roles.cache.has(credentials.roles.adminRole)) return;

    const characterId = parseInt(interaction.customId.replace(createCharacterRejectButtonIdPrefix, ""));
    try {
      await interaction.deferReply({ephemeral: true});
      const character = await prisma.character.delete({where: {id: characterId}});

      await interaction.editReply({
        content: ptBr.feedback.evaluation.rejected.replace("{user}", userMention(character?.userId)).replace("{mention}", interaction.user.toString()),
      });
      await interaction.message.delete().catch((error) => console.error("Error deleting message: ", error));
    } catch (characterRejectionError) {
      console.error("Error rejecting character: ", characterRejectionError);
    }
  }

  // User
  @ButtonComponent({
    id: createCharacterAppearanceButtonId,
  })
  public async buttonCreateCharacterAppearance(interaction: ButtonInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "appearance");
    } catch (error) {
      console.error("Error finding user to create character appearance modal: ", error);
    }
  }

  @ButtonComponent({
    id: createCharacterEssentialsButtonId,
  })
  public async buttonCreateCharacterEssentials(interaction: ButtonInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "essentials");
    } catch (error) {
      console.error("Error finding user to create character essentials modal: ", error);
    }
  }

  @SelectMenuComponent({
    id: createCharacterRaceSelectMenuId,
  })
  public async selectCreateCharacterRace(interaction: StringSelectMenuInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "race");
    } catch (error) {
      console.error("Error finding user to select race for their character: ", error);
    }
  }

  @SelectMenuComponent({
    id: createCharacterInstrumentSelectMenuId,
  })
  public async selectCreateCharacterInstrument(interaction: StringSelectMenuInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "instrument");
    } catch (error) {
      console.error("Error finding user to select initial instrument for their character: ", error);
    }
  }

  @SelectMenuComponent({
    id: createCharacterFactionSelectMenuId,
  })
  public async selectCreateCharacterFaction(interaction: StringSelectMenuInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "faction");
    } catch (error) {
      console.error("Error finding user to select faction for their character: ", error);
    }
  }

  @ButtonComponent({
    id: createCharacterSendButtonId,
  })
  public async buttonCreateCharacterSend(interaction: ButtonInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      if (user) this.handlePopupInteraction(interaction, user, "send");
    } catch (error) {
      console.error("Error finding user to send character embed to approval channel: ", error);
    }
  }

  @ButtonComponent({
    id: createCharacterPopupButtonId,
  })
  public async buttonCreateCharacter(interaction: ButtonInteraction) {
    try {
      await interaction.deferReply({ephemeral: true});
      const user = await prisma.user.create({data: {id: interaction.user.id}}).catch((error) => {
        if (error.code === "P2002") return prisma.user.findUnique({where: {id: interaction.user.id}}) as Promise<User>;
        throw error;
      });

      await prisma.character.deleteMany({where: {userId: user.id, AND: {isPending: true}}});

      await interaction.editReply({
        embeds: [this.createCharacterEmbed()],
        components: [this.createCharacterButtonRow()],
      });
    } catch (error) {
      console.error("Error creating character popup: ", error);
    }
  }

  @Slash({
    name: "create-character-modal",
    description: "Creates a character submission embed",
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    nameLocalizations: {"pt-BR": ptBr.commands.submission.name},
    descriptionLocalizations: {"pt-BR": ptBr.commands.submission.description},
  })
  public async submission(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.reply({
        embeds: [this.createSubmissionEmbed()],
        components: [this.createSubmissionButtonRow()],
      });
    } catch (error) {
      console.error("Error sending submission embed: ", error);
    }
  }

  private async handlePopupInteraction(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    user: User,
    type: "appearance" | "essentials" | "send" | "race" | "instrument" | "faction",
  ) {
    try {
      const character = await prisma.character.findFirst({where: {userId: user.id, isPending: true}, include: {instruments: true}});
      if (!character && type !== "essentials") {
        console.warn(`Character not found for user ${user.id}`);
        return;
      }

      const popupEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

      const getRemovedIndex = (id: string) =>
        interaction.message.components.findIndex((actionRow) => actionRow.components.some((component) => component.customId === id));

      switch (type) {
        case "essentials":
          await interaction.showModal(submissionEssentialsModal(character || undefined));
          const essentialsSubmitted = await awaitSubmitModal(interaction);

          const [name, surname, personality, backstory, age] = ["name", "surname", "personality", "backstory", "age"].map((key) =>
            essentialsSubmitted.fields.getTextInputValue(key),
          );

          popupEmbed.setDescription(backstory);
          popupEmbed.setTitle(`${name} ${surname}`);
          if (popupEmbed.data.fields) {
            const fieldsToCheck = [ptBr.character.age, ptBr.character.personality];
            popupEmbed.data.fields = popupEmbed.data.fields.filter((field) => !fieldsToCheck.includes(field.name));
          }
          popupEmbed.addFields([
            {
              name: ptBr.character.age,
              value: age.toString(),
            },
            {
              name: ptBr.character.personality,
              value: personality,
            },
          ]);

          const actionButtons = interaction.message.components[0].components
            .filter((component): component is ButtonComponentType => component.type === ComponentType.Button)
            .map((component) => {
              const newButton = ButtonBuilder.from(component);
              newButton.setDisabled(false);
              return newButton;
            });

          await interaction.editReply({
            embeds: [popupEmbed],
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(...actionButtons),
              await this.createRaceSelectMenu(),
              await this.createInstrumentSelectMenu(),
              await this.createFactionSelectMenu(),
            ],
          });

          await essentialsSubmitted.editReply({
            content: ptBr.feedback.essentials.submitted,
          });

          const created = await prisma.character.create({
            data: {name, surname, personality, backstory, age, userId: user.id, isPending: true, slug: lodash.kebabCase(`${name} ${surname}`)},
          });

          this.timeOuts.set(
            created.id.toString(),
            setTimeout(
              async () => {
                try {
                  await prisma.character.delete({where: {id: created.id, isPending: true}});
                } catch (error) {
                  console.error("Error finding character to delete: ", error);
                }
              },
              Duration.fromObject({hours: 1}).as("milliseconds"),
            ),
          );

          break;

        case "appearance":
          await interaction.showModal(submissionAppearanceModal(character || undefined));
          const appearanceSubmitted = await awaitSubmitModal(interaction);
          const [appearance, height, gender, weight, imageUrl] = ["appearance", "height", "gender", "weight", "imageUrl"].map((key) =>
            appearanceSubmitted.fields.getTextInputValue(key),
          );
          const sanitizedImageUrl = cleanImageUrl(imageUrl);
          if (!sanitizedImageUrl) {
            await appearanceSubmitted.editReply({content: ptBr.errors.imageLinkError});
            return;
          }

          popupEmbed.setImage(sanitizedImageUrl);
          if (popupEmbed.data.fields) {
            const fieldsToCheck = [ptBr.character.appearance, ptBr.character.height, ptBr.character.weight, ptBr.character.gender];
            popupEmbed.data.fields = popupEmbed.data.fields.filter((field) => !fieldsToCheck.includes(field.name));
          }
          popupEmbed.addFields([
            {name: ptBr.character.appearance, value: appearance},
            {name: ptBr.character.height, value: height},
            {name: ptBr.character.weight, value: weight},
            {name: ptBr.character.gender, value: gender},
          ]);

          await appearanceSubmitted.editReply({
            content: ptBr.feedback.appearance.submitted,
          });
          await interaction.editReply({
            embeds: [popupEmbed],
          });

          await prisma.character.update({data: {appearance, height, gender, weight, imageUrl: sanitizedImageUrl}, where: {id: character!.id}});
          break;

        case "race":
          if (!interaction.isStringSelectMenu()) return;
          await interaction.deferUpdate();
          if (character?.raceId) {
            await interaction.followUp({content: ptBr.errors.raceAlreadySelected, ephemeral: true});
            await prisma.character.update({data: {raceId: null}, where: {id: character!.id}});
            popupEmbed.data.fields = popupEmbed.data.fields?.filter((field) => field.name !== ptBr.character.race);
          }
          const raceId = parseInt(interaction.values[0]);

          const {race} = await prisma.character.update({data: {raceId}, where: {id: character!.id}, select: {race: {select: {name: true}}}});
          if (!race?.name) {
            await interaction.followUp({content: ptBr.errors.somethingWentWrong, ephemeral: true});
            return;
          }
          popupEmbed.addFields([{name: ptBr.character.race, value: race.name}]);

          const removedRaceIndex = getRemovedIndex(createCharacterRaceSelectMenuId);

          await interaction.editReply({
            embeds: [popupEmbed],
            components: await Promise.all(
              Array.from({length: interaction.message.components.length}).map(async (_, index) => {
                if (index === removedRaceIndex) return await this.createRaceSelectMenu(raceId);
                return interaction.message.components[index];
              }),
            ),
          });

          break;

        case "instrument":
          if (!interaction.isStringSelectMenu()) return;
          await interaction.deferUpdate();
          if (character!.instruments.length > 0) {
            await interaction.followUp({content: ptBr.errors.tooManyInstruments, ephemeral: true});
            await prisma.character.update({data: {instruments: {deleteMany: {}}}, where: {id: character!.id}});
            popupEmbed.data.fields = popupEmbed.data.fields?.filter((field) => field.name !== ptBr.character.instrument);
          }

          const instrumentId = parseInt(interaction.values[0]);

          const {instrument} = await prisma.instrumentCharacter.create({
            data: {characterId: character!.id, instrumentId},
            select: {instrument: {select: {name: true}}},
          });

          if (!instrument?.name) {
            await interaction.followUp({content: ptBr.errors.somethingWentWrong, ephemeral: true});
            return;
          }

          popupEmbed.addFields([{name: ptBr.character.instrument, value: instrument.name}]);

          const removedInstrumentIndex = getRemovedIndex(createCharacterInstrumentSelectMenuId);

          await interaction.editReply({
            embeds: [popupEmbed],
            components: await Promise.all(
              Array.from({length: interaction.message.components.length}).map(async (_, index) => {
                if (index === removedInstrumentIndex) return await this.createInstrumentSelectMenu(instrumentId);
                return interaction.message.components[index];
              }),
            ),
          });

          break;

        case "faction":
          if (!interaction.isStringSelectMenu()) return;
          await interaction.deferUpdate();
          if (character?.factionId) {
            await interaction.followUp({content: ptBr.errors.factionAlreadySelected, ephemeral: true});
            await prisma.character.update({data: {factionId: null}, where: {id: character.id}});
            popupEmbed.data.fields = popupEmbed.data.fields?.filter((field) => field.name !== ptBr.character.faction);
          }
          const factionId = parseInt(interaction.values[0]);

          const {faction} = await prisma.character.update({
            data: {factionId},
            where: {id: character!.id},
            select: {faction: {select: {name: true, emoji: true}}},
          });
          if (!faction?.name) {
            await interaction.followUp({content: ptBr.errors.somethingWentWrong, ephemeral: true});
            return;
          }
          popupEmbed.addFields([{name: ptBr.character.faction, value: `${faction.emoji} ${faction.name}`}]);

          const removedFactionIndex = getRemovedIndex(createCharacterFactionSelectMenuId);
          await interaction.editReply({
            embeds: [popupEmbed],
            components: await Promise.all(
              Array.from({length: interaction.message.components.length}).map(async (_, index) => {
                if (index === removedFactionIndex) return await this.createFactionSelectMenu(factionId);
                return interaction.message.components[index];
              }),
            ),
          });

          break;

        case "send":
          await interaction.deferUpdate();
          await interaction.editReply({
            embeds: [],
            content: ptBr.feedback.send.submitted,
            components: [],
          });
          const approvalChannel = interaction.guild?.channels.cache.get(credentials.channels.evaluationChannel);
          if (approvalChannel?.type !== ChannelType.GuildText) {
            console.error(`Approval channel is not a text channel: ${approvalChannel?.id}`);
            return;
          }
          const characterToEvaluateMessage = await approvalChannel.send({
            embeds: [popupEmbed],
            components: [createCharacterEvaluationButtonRow(character!.id)],
            content: ptBr.feedback.evaluation.waiting
              .replace("{user}", interaction.user.toString())
              .replace("{mention}", roleMention(credentials.roles.adminRole)),
          });

          const evaluationThread = await characterToEvaluateMessage.startThread({
            name: ptBr.feedback.evaluation.threadName.replace("{characterName}", `${character!.name} ${character!.surname}`),
          });
          evaluationThread.permissionsFor(interaction.user.id)?.add(PermissionFlagsBits.ViewChannel).add(PermissionFlagsBits.SendMessages);
          evaluationThread.send({
            content: ptBr.feedback.evaluation.waiting
              .replace("{user}", interaction.user.toString())
              .replace("{mention}", roleMention(credentials.roles.adminRole)),
          });
          await prisma.character.updateMany({where: {userId: user.id}, data: {isBeingUsed: false}});
          await prisma.character.update({data: {isPending: false, isBeingUsed: true}, where: {id: character!.id}});
          break;

        default:
          console.error(`Unsupported type: ${type}`);
          break;
      }
    } catch (error) {
      console.error(`Error creating character ${type} modal: `, error);
    }
  }

  private createCharacterEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ptBr.createCharacter.title)
      .setDescription(ptBr.createCharacter.description)
      .setFooter({text: ptBr.createCharacter.footerText})
      .setImage(imageLinks.submissionEmbedPopupThumbnail)
      .setColor(Colors.DarkVividPink);
  }

  private createCharacterButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(createCharacterEssentialsButtonId).setLabel(ptBr.buttons.essentials).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(createCharacterAppearanceButtonId).setLabel(ptBr.buttons.appearance).setDisabled(true).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(createCharacterSendButtonId).setLabel(ptBr.buttons.send).setDisabled(true).setStyle(ButtonStyle.Success),
    );
  }

  private async createRaceSelectMenu(selectedRaceId?: number) {
    const races = await prisma.race.findMany({take: 25, orderBy: {name: "asc"}});
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(createCharacterRaceSelectMenuId)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder(ptBr.selectMenus.race.placeholder)
        .addOptions(
          races.map((race) => {
            const option = new StringSelectMenuOptionBuilder().setLabel(race.name).setValue(race.id.toString());
            if (selectedRaceId === race.id) {
              option.setDefault(true);
            }
            return option;
          }),
        ),
    );
  }

  private async createFactionSelectMenu(selectedFactionId?: number) {
    const factions = await prisma.faction.findMany({take: 25, orderBy: {name: "asc"}});
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(createCharacterFactionSelectMenuId)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder(ptBr.selectMenus.faction.placeholder)
        .addOptions(
          factions.map((faction) => {
            const option = new StringSelectMenuOptionBuilder().setLabel(faction.name).setValue(faction.id.toString()).setEmoji(faction.emoji);
            if (selectedFactionId === faction.id) {
              option.setDefault(true);
            }
            return option;
          }),
        ),
    );
  }

  private async createInstrumentSelectMenu(selectedInstrumentId?: number) {
    const instruments = await prisma.instrument.findMany({take: 25, orderBy: {id: "asc"}});
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(createCharacterInstrumentSelectMenuId)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder(ptBr.selectMenus.instrument.placeholder)
        .addOptions(
          instruments
            .filter((instrument) => instrument.isBeginner)
            .map((instrument) => {
              const option = new StringSelectMenuOptionBuilder().setLabel(instrument.name).setValue(instrument.id.toString());
              if (selectedInstrumentId === instrument.id) {
                option.setDefault(true);
              }
              return option;
            }),
        ),
    );
  }

  private createSubmissionEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ptBr.submission.title)
      .setDescription(ptBr.submission.description)
      .setFooter({text: ptBr.submission.footerText})
      .setThumbnail(imageLinks.submissionEmbedThumbnail)
      .setTimestamp(Date.now())
      .setColor(Colors.DarkVividPink);
  }

  private createSubmissionButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(createCharacterPopupButtonId).setLabel(ptBr.buttons.createCharacter).setStyle(ButtonStyle.Success),
    );
  }
}
