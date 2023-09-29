import {ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction, User} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import {ptBr} from "../translations/ptBr";

@Discord()
export class Profile {
  @Slash({
    name: "profile",
    description: "Displays your profile or a user's profile.",
    descriptionLocalizations: {
      "pt-BR": ptBr.commands.profile.description,
    },
    nameLocalizations: {
      "pt-BR": ptBr.commands.profile.name,
    },
  })
  async profile(
    @SlashOption({
      name: "user",
      required: false,
      description: "The user to display the profile.",
      descriptionLocalizations: {
        "pt-BR": ptBr.commands.profile.options.user.description,
      },
      nameLocalizations: {
        "pt-BR": ptBr.commands.profile.options.user.name,
      },
      type: ApplicationCommandOptionType.User,
    })
    user: User | null = null,
    interaction: ChatInputCommandInteraction,
  ) {
    if (!user) {
      user = interaction.user;
    }
    try {
      await interaction.deferReply();
      const response = await fetch(`http://localhost:8080/profile/${user.id}`);
      if (!response.ok) {
        interaction.editReply(ptBr.errors.generatingProfile).catch((error) => "Error sending error feedback: " + error);
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
}
