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
  roleMention,
  userMention,
} from "discord.js";
import {ButtonComponent, Discord, Slash} from "discordx";
import {Duration} from "luxon";
import {imageLinks} from "../data/assets";
import {credentials} from "../data/credentials";
import {prisma} from "../db";
import {submissionAppearanceModal, submissionEssentialsModal} from "../lib/components/modals";
import {cleanImageUrl} from "../lib/util/helpers";
import {ptBr} from "../translations/ptBr";

const createCharacterPopupButtonId = "createCharacter";
const createCharacterEssentialsButtonId = "createCharacterEssentials";
const createCharacterAppearanceButtonId = "createCharacterAppearance";
const createCharacterSendButtonId = "createCharacterSend";
const createCharacterApproveButtonIdPrefix = "createCharacterApprove-";
const createCharacterRejectButtonIdPrefix = "createCharacterReject-";
const createCharacterApproveButtonId = (characterId: number) => createCharacterApproveButtonIdPrefix + characterId;
const createCharacterRejectButtonId = (characterId: number) => createCharacterRejectButtonIdPrefix + characterId;

@Discord()
export class Submission {
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
      const character = await prisma.character.findUnique({where: {id: characterId}});
      if (!character?.userId) {
        console.error(`User for character ${characterId} not found`);
        return;
      }

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
      await prisma.character.create({data: {userId: user.id, isPending: true}});

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

  private async handlePopupInteraction(interaction: ButtonInteraction, user: User, type: "appearance" | "essentials" | "send") {
    try {
      const character = await prisma.character.findFirst({where: {userId: user.id, isPending: true}});
      if (!character) {
        console.warn(`Character not found for user ${user.id}`);
        return;
      }

      const awaitSubmitModal = async () => {
        const submitted = await interaction.awaitModalSubmit({
          time: Duration.fromObject({hours: 1}).as("milliseconds"),
          filter: (submitInteraction) => submitInteraction.user.id === interaction.user.id,
        });
        await submitted.deferReply({ephemeral: true});
        return submitted;
      };

      const popupEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

      switch (type) {
        case "essentials":
          await interaction.showModal(submissionEssentialsModal(character));
          const essentialsSubmitted = await awaitSubmitModal();

          const [name, surname, personality, backstory, age] = ["name", "surname", "personality", "backstory", "age"].map((key) =>
            essentialsSubmitted.fields.getTextInputValue(key),
          );

          popupEmbed.setDescription(backstory);
          popupEmbed.setTitle(`${name} ${surname}`);
          popupEmbed.setFields([
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
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionButtons)],
          });

          await essentialsSubmitted.editReply({
            content: ptBr.feedback.essentials.submitted,
          });

          await prisma.character.update({data: {name, surname, personality, backstory, age}, where: {id: character.id}});

          break;

        case "appearance":
          await interaction.showModal(submissionAppearanceModal(character));
          const appearanceSubmitted = await awaitSubmitModal();
          const [appearance, height, gender, weight, imageUrl] = ["appearance", "height", "gender", "weight", "imageUrl"].map((key) =>
            appearanceSubmitted.fields.getTextInputValue(key),
          );
          const sanitizedImageUrl = cleanImageUrl(imageUrl);
          if (!sanitizedImageUrl) {
            await appearanceSubmitted.editReply({content: ptBr.errors.imageLinkError});
            return;
          }

          popupEmbed.setImage(sanitizedImageUrl);
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

          await prisma.character.update({data: {appearance, height, gender, weight, imageUrl: sanitizedImageUrl}, where: {id: character.id}});
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
            components: [this.createCharacterEvaluationButtonRow(character.id)],
            content: ptBr.feedback.evaluation.waiting
              .replace("{user}", interaction.user.toString())
              .replace("{mention}", roleMention(credentials.roles.adminRole)),
          });

          const evaluationThread = await characterToEvaluateMessage.startThread({
            name: ptBr.feedback.evaluation.threadName.replace("{characterName}", `${character.name} ${character.surname}`),
          });
          evaluationThread.permissionsFor(interaction.user.id)?.add(PermissionFlagsBits.ViewChannel).add(PermissionFlagsBits.SendMessages);
          evaluationThread.send({
            content: ptBr.feedback.evaluation.waiting
              .replace("{user}", interaction.user.toString())
              .replace("{mention}", roleMention(credentials.roles.adminRole)),
          });

          await prisma.character.update({data: {isPending: false}, where: {id: character.id}});
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

  private createCharacterEvaluationButtonRow(characterId: number): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(createCharacterApproveButtonId(characterId)).setLabel(ptBr.buttons.approve).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(createCharacterRejectButtonId(characterId)).setLabel(ptBr.buttons.reject).setStyle(ButtonStyle.Danger),
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
