import {ChatInputCommandInteraction, EmbedBuilder, userMention} from "discord.js";
import {Discord, Slash} from "discordx";
import ptBr from "translations";
import {prisma} from "../db";
import {Pagination} from "@discordx/pagination";
import {Prisma} from "@prisma/client";
import {getUserLevelDetails} from "../lib/util/helpers";
import {PAGINATION_DEFAULT_OPTIONS} from "../data/constants";
import {chunk} from "lodash";

const PER_PAGE = 10;

@Discord()
export class Top {
  @Slash({
    name: "top",
    description: "Displays the top authors in the server.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.top.description},
    nameLocalizations: {"pt-BR": ptBr.commands.top.name},
  })
  async main(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const topByMessage = async () =>
        await prisma.user.findMany({
          orderBy: {messages: {_count: "desc"}},
          include: {characters: {select: {factionId: true}, where: {isBeingUsed: true}}, messages: {select: {id: true}}},
        });
      const userEntry = async (
        user: Prisma.UserGetPayload<{include: {characters: {select: {factionId: true}; where: {isBeingUsed: true}}; messages: {select: {id: true}}}}>,
        index: number,
      ) => {
        const levelDetails = getUserLevelDetails(user);
        const factionId = user.characters.at(0)?.factionId;
        let factionEmoji: string | undefined;
        if (factionId) {
          const faction = await prisma.faction.findFirst({where: {id: factionId}});
          factionEmoji = faction?.emoji;
        }
        const emoji = interaction.guild?.emojis.cache.find((emoji) => emoji.id === levelDetails.emojiId);
        if (factionEmoji && emoji) return `**${index}.** ${factionEmoji} ${emoji} ${userMention(user.id)} - **${user.messages.length}**`;
        return `**${index}.** ${emoji} ${userMention(user.id)} - **${user.messages.length}**`;
      };

      const generatePages = async () => {
        const top = await topByMessage();
        const topEntries = await Promise.all(top.map((user, index) => userEntry(user, index + 1)));
        const chunks = chunk(topEntries, PER_PAGE);
        return chunks.map((chunk) => {
          return {
            embeds: [
              new EmbedBuilder()
                .setTitle(`${interaction.guild?.name} - ${ptBr.embeds.topTile}`)
                .setColor("Random")
                .setDescription(chunk.join("\n")),
            ],
          };
        });
      };
      const pages = await generatePages();
      const pagination = new Pagination(interaction, pages, {
        ...PAGINATION_DEFAULT_OPTIONS,
        onTimeout: () => interaction.deleteReply().catch((error) => console.error("Error deleting reply", error)),
      });

      await pagination.send();
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: ptBr.errors.somethingWentWrong,
      });
    }
  }
}
