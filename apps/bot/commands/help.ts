import {CommandInteraction, PermissionFlagsBits} from "discord.js";
import {Discord, MetadataStorage, Slash} from "discordx";
import ptBr from "translations";
import {bot} from "../main";

@Discord()
export class Help {
  @Slash({
    name: "help",
    description: "Help command",
    descriptionLocalizations: {"pt-BR": ptBr.commands.help.description},
    nameLocalizations: {"pt-BR": ptBr.commands.help.name},
  })
  async helpSlashCommand(interaction: CommandInteraction) {
    try {
      if (!interaction.inCachedGuild()) return;
      const commands = await interaction.client.application?.commands.fetch();
      const isAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator);
      const commandsString = commands
        .filter((command) => {
          const isAdminCommand = command.defaultMemberPermissions?.has(PermissionFlagsBits.Administrator);
          if (isAdminCommand && !isAdmin) return false;
          return true;
        })
        .map((command) => `</${command.name}:${command.id}> : ${command.descriptionLocalizations?.["pt-BR"]}`)
        .join("\n");

      const simpleCommandsString = MetadataStorage.instance.simpleCommands
        .filter((command) => {
          if (isAdmin) return true;
          else if (isAdmin && command.name === ptBr.commands.delete.name) return false;
          return true;
        })
        .map((command) => `${bot.prefix}${command.name} : ${command.description}`)
        .join("\n");

      await interaction.reply({
        ephemeral: true,
        content: ptBr.feedback.helpMessage
          .replace("{simpleCommands}", simpleCommandsString)
          .replace("{commands}", commandsString)
          .replaceAll("{botName}", interaction.client.user?.username),
      });
      return;
    } catch (error) {
      console.log("Error sending help message:", error);
      await interaction.reply({content: ptBr.errors.helpMessage, ephemeral: true}).catch((error) => console.log("Error sending reply feedback:", error));
    }
  }
}
