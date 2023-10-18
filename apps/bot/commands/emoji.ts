import {ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import lodash from "lodash";
import sharp from "sharp";
import ptBr from "translations";

@Discord()
export class Emoji {
  @Slash({
    name: "emoji",
    description: "Add an emoji to the server",
    descriptionLocalizations: {"pt-BR": ptBr.commands.emoji.description},
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  })
  async emoji(
    @SlashOption({
      name: "link_or_id",
      description: "The emoji link or id",
      descriptionLocalizations: {"pt-BR": ptBr.commands.emoji.options.link_or_id.description},
      nameLocalizations: {"pt-BR": ptBr.commands.emoji.options.link_or_id.name},
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    linkOrId: string,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply();

      const emojiDetails = this.extractEmojiDetails(linkOrId);
      if (!emojiDetails) {
        await interaction.editReply(ptBr.feedback.wrongEmojiFormat);
        return;
      }

      const {emojiId, emojiName, isAnimated} = emojiDetails;

      const emojiUrl = this.constructEmojiUrl(emojiId, isAnimated);
      const resizedEmojiBuffer = await this.fetchAndResizeEmoji(emojiUrl, isAnimated);

      const emojiCreated = await interaction.guild?.emojis.create({
        attachment: resizedEmojiBuffer,
        name: lodash.snakeCase(emojiName),
      });

      if (!emojiCreated) {
        await interaction.editReply(ptBr.errors.emojiNotCreated);
        return;
      }

      await interaction.editReply(ptBr.feedback.emojiCreated.replace("{emoji}", emojiCreated.toString()));
    } catch (error) {
      await interaction.editReply(ptBr.errors.somethingWentWrong);
      console.error(error);
    }
  }

  private extractEmojiDetails(linkOrId: string) {
    const isLink = linkOrId.startsWith("https://");
    const emojiMatch = linkOrId.match(/<a?(:.+):(\d+)>/);
    const isAnimated = linkOrId.startsWith("<a:") || linkOrId.endsWith(".gif");

    if (isLink) {
      return {
        emojiId: linkOrId.split("/").pop()?.split(".")[0] || "",
        emojiName: linkOrId.split("/").pop()?.split(".")[0] || "",
        isAnimated: isAnimated,
      };
    } else if (emojiMatch) {
      return {
        emojiId: emojiMatch[2],
        emojiName: emojiMatch[1].replace(/^a:/, ""),
        isAnimated: isAnimated,
      };
    } else if (/^\d+$/.test(linkOrId)) {
      return {
        emojiId: linkOrId,
        emojiName: linkOrId,
        isAnimated: false,
      };
    }

    return null;
  }

  private constructEmojiUrl(emojiId: string, isAnimated: boolean = false) {
    const fileExtension = isAnimated ? "gif" : "png";
    return `https://cdn.discordapp.com/emojis/${emojiId}.${fileExtension}`;
  }

  private async fetchAndResizeEmoji(emojiUrl: string, isAnimated: boolean = false) {
    const emojiBuffer = await (await fetch(emojiUrl)).arrayBuffer();
    if (isAnimated) return emojiUrl;
    else return await sharp(emojiBuffer).resize(128, 128).png().toBuffer();
  }
}
