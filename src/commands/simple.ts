import {ChannelType, EmbedBuilder, PermissionFlagsBits} from "discord.js";
import {Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType} from "discordx";
import {DateTime} from "luxon";
import {imageLinks} from "../data/assets";
import {ptBr} from "../translations/ptBr";

@Discord()
export class Simple {
  @SimpleCommand({
    aliases: ["poll", "vote"],
    description: ptBr.commands.poll.description,
    name: ptBr.commands.poll.name,
    argSplitter(command) {
      return command.argString.split("|");
    },
  })
  async pollSimpleCommand(
    @SimpleCommandOption({
      name: ptBr.commands.poll.options.title.name,
      type: SimpleCommandOptionType.String,
      description: ptBr.commands.poll.options.title.description,
    })
    title: string,
    @SimpleCommandOption({
      name: ptBr.commands.poll.options.options.name,
      type: SimpleCommandOptionType.String,
      description: ptBr.commands.poll.options.options.description,
    })
    options: string,
    command: SimpleCommandMessage,
  ) {
    try {
      if (command.message.author.bot) return;

      if (!command.isValid()) {
        await command.sendUsageSyntax();
        return;
      }
      const parsedOptions = options.split(";").filter((option) => option.length);
      const emojiNumbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      const pollEmbed = new EmbedBuilder()
        .setAuthor({iconURL: imageLinks.submissionEmbedThumbnail, name: command.message.guild?.name || "Unknown server"})
        .setTitle(title)
        .setDescription(parsedOptions.map((option, index) => `${emojiNumbers[index]} ${option}`).join("\n"))
        .setColor("Random")
        .setThumbnail(imageLinks.pollEmbedThumbnail)
        .setTimestamp(DateTime.now().toJSDate());

      const pollMessage = await command.message.channel.send({embeds: [pollEmbed]});
      for (let index = 0; index < parsedOptions.length; index++) await pollMessage.react(emojiNumbers[index]);

      await command.message.delete();
    } catch (error) {
      console.log(error);
    }
  }

  @SimpleCommand({
    aliases: ["delete"],
    description: ptBr.commands.delete.description,
    name: ptBr.commands.delete.name,
    argSplitter(command) {
      return command.argString.split(" ");
    },
  })
  async deleteBulkSimpleCommand(
    @SimpleCommandOption({
      name: ptBr.commands.delete.options.amount.name,
      type: SimpleCommandOptionType.Number,
      description: ptBr.commands.delete.options.amount.description,
    })
    amount: number,
    command: SimpleCommandMessage,
  ) {
    try {
      if (
        command.message.author.bot ||
        !command.message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
        command.message.channel.type !== ChannelType.GuildText
      )
        return;
      if (!command.isValid()) {
        await command.sendUsageSyntax();
        return;
      }
      if (amount > 100) {
        await command.message.channel.send(ptBr.feedback.deleteBulkLimit);
        return;
      }

      const messages = await command.message.channel.messages.fetch({limit: amount}).catch((error) => console.log("Error deleting message", error));

      const newMessages = messages?.filter((message) => message.createdAt > DateTime.now().minus({days: 14}).toJSDate());
      if (newMessages?.size) await command.message.channel.bulkDelete(newMessages).catch((error) => console.error("Error deleting messages in bulk", error));

      const oldMessages = messages?.filter((message) => message.createdAt < DateTime.now().minus({days: 14}).toJSDate());
      if (oldMessages?.size)
        for await (const message of oldMessages?.values()) await message.delete().catch((error) => console.log("Error deleting message", error));
    } catch (error) {
      console.log("Error deleting messages in bulk", error);
    }
  }
}
