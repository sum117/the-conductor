import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  User,
} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import {DateTime} from "luxon";
import ptBr from "translations";
import {prisma} from "../db";
import {awaitSubmitModal} from "../lib/util/helpers";
const aboutMeModalId = "aboutMeModal";
const aboutMeTextInputId = "aboutMeTextInput";

@Discord()
export class Profile {
  @Slash({
    name: "profile",
    description: "Displays your profile or a user's profile.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.profile.description},
    nameLocalizations: {"pt-BR": ptBr.commands.profile.name},
  })
  async profile(
    @SlashOption({
      name: "user",
      required: false,
      description: "The user to display the profile.",
      descriptionLocalizations: {"pt-BR": ptBr.commands.profile.options.user.description},
      nameLocalizations: {"pt-BR": ptBr.commands.profile.options.user.name},
      type: ApplicationCommandOptionType.User,
    })
    member: GuildMember | null = null,
    interaction: ChatInputCommandInteraction,
  ) {
    if (!member && interaction.inCachedGuild()) {
      member = interaction.member;
    }
    try {
      await interaction.deferReply();
      const response = await fetch(`http://localhost:8080/api/image-gen/profile/${member!.id}`);
      if (!response.ok) {
        interaction.editReply(ptBr.errors.generatingProfile);
        return;
      }
      const buffer = await response.arrayBuffer();
      const attachment = new AttachmentBuilder(Buffer.from(buffer)).setName("profile.png");

      await interaction.editReply({
        files: [attachment],
      });
    } catch (profileGenerationError) {
      console.log("Error generating profile:", profileGenerationError);
      interaction.editReply(ptBr.errors.somethingWentWrong).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "set-about-me",
    description: "Sets your about me.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.setAboutMe.description},
    nameLocalizations: {"pt-BR": ptBr.commands.setAboutMe.name},
  })
  async setAboutMe(interaction: ChatInputCommandInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});

      const aboutMeInput = new TextInputBuilder()
        .setCustomId(aboutMeTextInputId)
        .setLabel(ptBr.modals.aboutMe.newAboutMe.label)
        .setPlaceholder(ptBr.modals.aboutMe.newAboutMe.placeholder)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(1)
        .setMaxLength(500);

      if (user?.about) {
        aboutMeInput.setValue(user.about);
      }

      const aboutMeModal = new ModalBuilder()
        .setTitle(ptBr.modals.aboutMe.title)
        .setCustomId(aboutMeModalId)
        .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(aboutMeInput));

      await interaction.showModal(aboutMeModal);

      const submitted = await awaitSubmitModal(interaction);
      const aboutMe = submitted.fields.getTextInputValue(aboutMeTextInputId);

      await prisma.user.update({where: {id: interaction.user.id}, data: {about: aboutMe}});

      await submitted.editReply(ptBr.feedback.aboutMe.submitted);
    } catch (setAboutMeError) {
      console.log("Error setting about me:", setAboutMeError);
      interaction.editReply(ptBr.errors.aboutMe).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "rep-someone",
    description: "Give someone a reputation point every 24 hours.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.repSomeone.description},
    nameLocalizations: {"pt-BR": ptBr.commands.repSomeone.name},
  })
  async repSomeone(
    @SlashOption({
      name: "user",
      description: "The user to give reputation.",
      descriptionLocalizations: {"pt-BR": ptBr.commands.repSomeone.options.user.description},
      nameLocalizations: {"pt-BR": ptBr.commands.repSomeone.options.user.name},
      type: ApplicationCommandOptionType.User,
    })
    targetUser: User,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply();
      if (targetUser.id === interaction.user.id) {
        await interaction.editReply(ptBr.feedback.reputation.self);
        return;
      }
      const lastReputation = await prisma.user.findUnique({where: {id: interaction.user.id}, select: {lastReputationGiven: true}});
      const difference = DateTime.now().diff(DateTime.fromJSDate(lastReputation?.lastReputationGiven ?? new Date()), "hours");

      if (difference.hours < 24) {
        await interaction.editReply(ptBr.feedback.reputation.tooEarly);
        return;
      }

      await prisma.user.update({where: {id: targetUser.id}, data: {reputation: {increment: 1}}});
      await prisma.user.update({where: {id: interaction.user.id}, data: {lastReputationGiven: DateTime.now().toJSDate()}});

      await interaction.editReply(ptBr.feedback.reputation.success.replace("{user}", targetUser.toString()));
    } catch (reputationError) {
      console.log("Error giving reputation:", reputationError);
      interaction.editReply(ptBr.errors.reputation).catch((error) => "Error sending error feedback: " + error);
    }
  }
}
