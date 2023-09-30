import {EmbedBuilder} from "discord.js";
import {Discord, SimpleCommand, SimpleCommandMessage} from "discordx";
import {DateTime} from "luxon";
import {imageLinks} from "../data/assets";
import {ptBr} from "../translations/ptBr";

@Discord()
export class Poll {
  @SimpleCommand({
    aliases: ["poll", "vote"],
    description: ptBr.commands.poll.description,
    name: ptBr.commands.poll.name,
  })
  async pollSimpleCommand(command: SimpleCommandMessage) {
    try {
      if (command.message.author.bot) return;

      if (!command.isValid()) {
        await command.sendUsageSyntax();
        return;
      }

      const [title, ...options] = command.argString.split("|");
      if (!title || !options) {
        return;
      }
      const emojiNumbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      const pollEmbed = new EmbedBuilder()
        .setAuthor({iconURL: imageLinks.submissionEmbedThumbnail, name: command.message.guild?.name || "Unknown server"})
        .setTitle(title)
        .setDescription(options.map((option, index) => `${emojiNumbers[index]} ${option}`).join("\n"))
        .setColor("Random")
        .setThumbnail(imageLinks.pollEmbedThumbnail)
        .setTimestamp(DateTime.now().toJSDate());

      const pollMessage = await command.message.channel.send({embeds: [pollEmbed]});
      for (let index = 0; index < options.length; index++) await pollMessage.react(emojiNumbers[index]);

      await command.message.delete();
    } catch (error) {
      console.log(error);
    }
  }
}
