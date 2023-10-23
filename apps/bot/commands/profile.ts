import {ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction, GuildMember, User} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import {DateTime} from "luxon";
import ptBr from "translations";
import {getSafeKeys} from "utilities";
import {prisma} from "../db";
import {colorPreferencesFields, colorPreferencesModal, profileAssetsFields, profileAssetsModal} from "../lib/components/modals";
import {awaitSubmitModal} from "../lib/util/helpers";

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
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}, include: {profilePreferences: true}});

      await interaction.showModal(
        profileAssetsModal({
          about: user?.profilePreferences?.about ?? "",
          backgroundUrl: user?.profilePreferences?.backgroundUrl ?? "",
        }),
      );

      const submitted = await awaitSubmitModal(interaction);
      const aboutMe = submitted.fields.getTextInputValue(profileAssetsFields.about).trim();
      const backgroundUrl = submitted.fields.getTextInputValue(profileAssetsFields.backgroundUrl).trim();

      await prisma.user.update({
        data: {
          profilePreferences: {
            upsert: {
              create: {about: Boolean(aboutMe) ? aboutMe : undefined, backgroundUrl: Boolean(backgroundUrl) ? backgroundUrl : null},
              update: {about: Boolean(aboutMe) ? aboutMe : undefined, backgroundUrl: Boolean(backgroundUrl) ? backgroundUrl : null},
            },
          },
        },
        where: {id: interaction.user.id},
      });

      await submitted.editReply(ptBr.feedback.aboutMe.submitted);
    } catch (setAboutMeError) {
      console.log("Error setting about me:", setAboutMeError);
      interaction.editReply(ptBr.errors.aboutMe).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "set-profile-colors",
    description: "Sets your profile colors.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.setProfileColors.description},
    nameLocalizations: {"pt-BR": ptBr.commands.setProfileColors.name},
  })
  async setProfileColors(interaction: ChatInputCommandInteraction) {
    try {
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}, include: {profilePreferences: true}});

      await interaction.showModal(
        colorPreferencesModal({
          featuredCharBorderColor: user?.profilePreferences?.featuredCharBorderColor ?? "",
          repBarColor: user?.profilePreferences?.repBarColor ?? "",
          textColor: user?.profilePreferences?.textColor ?? "",
          xpBarBackgroundColor: user?.profilePreferences?.xpBarBackgroundColor ?? "",
          xpBarFillColor: user?.profilePreferences?.xpBarFillColor ?? "",
        }),
      );

      const submitted = await awaitSubmitModal(interaction);

      const fields = getSafeKeys(colorPreferencesFields).reduce(
        (acc, key) => {
          if (submitted.fields.getTextInputValue(colorPreferencesFields[key])) acc[key] = submitted.fields.getTextInputValue(colorPreferencesFields[key]);
          return acc;
        },
        <Record<keyof typeof colorPreferencesFields, string>>{},
      );

      await prisma.user.update({
        data: {profilePreferences: {upsert: {create: fields, update: fields}}},
        where: {id: interaction.user.id},
      });

      await submitted.editReply(ptBr.feedback.profileColors.submitted);
    } catch (setProfileColorsError) {
      console.log("Error setting profile colors:", setProfileColorsError);
      interaction.editReply(ptBr.errors.profileColors).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "set-afk-message",
    description: "Sets your AFK message.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.setAfkMessage.description},
    nameLocalizations: {"pt-BR": ptBr.commands.setAfkMessage.name},
  })
  async setAfkMessage(
    @SlashOption({
      name: "message",
      description: "The message to display when someone mentions you.",
      descriptionLocalizations: {"pt-BR": ptBr.commands.setAfkMessage.options.message.description},
      nameLocalizations: {"pt-BR": ptBr.commands.setAfkMessage.options.message.name},
      type: ApplicationCommandOptionType.String,
    })
    message: string | undefined,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply();

      const current = await prisma.user.findUnique({where: {id: interaction.user.id}, select: {afkMessage: true}});
      if (!message && !current?.afkMessage) {
        await interaction.editReply(ptBr.feedback.afkMessage.empty);
        return;
      }
      if (current?.afkMessage) {
        await prisma.user.update({where: {id: interaction.user.id}, data: {afkMessage: null}});
        await interaction.editReply(ptBr.feedback.afkMessage.removed);
        return;
      }
      await prisma.user.update({where: {id: interaction.user.id}, data: {afkMessage: message}});
      await interaction.editReply(ptBr.feedback.afkMessage.submitted);
    } catch (afkMessageError) {
      console.log("Error setting AFK message:", afkMessageError);
      interaction.editReply(ptBr.errors.afkMessage).catch((error) => "Error sending error feedback: " + error);
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
