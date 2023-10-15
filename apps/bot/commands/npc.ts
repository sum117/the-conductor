import {Pagination} from "@discordx/pagination";
import {Prisma} from "@prisma/client";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  userMention,
} from "discord.js";
import {Discord, Slash, SlashChoice, SlashOption} from "discordx";
import lodash from "lodash";
import ptBr from "translations";
import {PAGINATION_DEFAULT_OPTIONS} from "../data/constants";
import {prisma} from "../db";
import {getNPCDetails} from "../lib/util/helpers";

const getNPCAautocomplete = async (interaction: AutocompleteInteraction) => {
  const npcs = await prisma.nPC
    .findMany({where: {name: {contains: interaction.options.getFocused()}}})
    .catch((error) => console.log("Error fetching NPC list:", error));
  if (!npcs) return;
  interaction.respond(npcs.map((npc) => ({name: npc.name, value: npc.id}))).catch((error) => console.log("Error sending NPC list:", error));
};

@Discord()
export class NPC {
  @Slash({
    name: "toggle-npc-mode",
    description: "Toggle NPC mode.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.toggleNPCMode.description},
    nameLocalizations: {"pt-BR": ptBr.commands.toggleNPCMode.name},
  })
  async toggleNpcMode(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ephemeral: true});
      const user = await prisma.user.findUnique({where: {id: interaction.user.id}});
      await prisma.user.update({where: {id: interaction.user.id}, data: {isUsingNPC: !user?.isUsingNPC}});
      await interaction.editReply(ptBr.feedback.toggleNPCMode[user?.isUsingNPC ? "false" : "true"]);
    } catch (toggleNpcModeErrors) {
      console.log("Error toggling NPC mode:", toggleNpcModeErrors);
      interaction.editReply(ptBr.errors.toggleNPCMode).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "assign-npc",
    description: "Assign an NPC to a user.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.assignNPC.description},
    nameLocalizations: {"pt-BR": ptBr.commands.assignNPC.name},
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  })
  async assignNPC(
    @SlashOption({
      name: "npc",
      description: "The NPC to assign.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.assignNPC.options.npc.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.assignNPC.options.npc.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getNPCAautocomplete,
    })
    npcId: number,
    @SlashOption({
      name: "user",
      description: "The user to assign the NPC to.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.assignNPC.options.user.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.assignNPC.options.user.description},
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});
      const npc = await prisma.nPC.update({where: {id: npcId}, data: {usersWhoOwn: {connect: {id: user.id}}}});
      await interaction.editReply(ptBr.feedback.assignedNPC.replace("{name}", npc.name).replace("{user}", user.toString()));
    } catch (assignNPCError) {
      console.log("Error assigning NPC:", assignNPCError);
      await interaction.editReply(ptBr.errors.assignNPC).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "delete-npc",
    description: "Delete an NPC.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.deleteNPC.description},
    nameLocalizations: {"pt-BR": ptBr.commands.deleteNPC.name},
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  })
  async deleteNPC(
    @SlashOption({
      name: "name",
      description: "The name of the NPC.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.deleteNPC.options.name.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.deleteNPC.options.name.description},
      type: ApplicationCommandOptionType.Number,
      autocomplete: getNPCAautocomplete,
    })
    id: number,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});
      const deleted = await prisma.nPC.delete({where: {id}});
      await interaction.editReply(ptBr.feedback.deleteNPC.replace("{name}", deleted.name));
    } catch (deleteNPCErrors) {
      console.log("Error deleting NPC:", deleteNPCErrors);
    }
  }

  @Slash({
    name: "create-npc",
    description: "Create a new NPC.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.description},
    nameLocalizations: {"pt-BR": ptBr.commands.createNPC.name},
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  })
  async createNPC(
    @SlashOption({
      name: "name",
      description: "The name of the NPC.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.name.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.name.description},
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    @SlashChoice({name: ptBr.npc.rarity.common, value: "common"})
    @SlashChoice({name: ptBr.npc.rarity.uncommon, value: "uncommon"})
    @SlashChoice({name: ptBr.npc.rarity.rare, value: "rare"})
    @SlashChoice({name: ptBr.npc.rarity.epic, value: "epic"})
    @SlashChoice({name: ptBr.npc.rarity.legendary, value: "legendary"})
    @SlashOption({
      name: "rarity",
      description: "The rarity of the NPC.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.rarity.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.rarity.description},
      type: ApplicationCommandOptionType.String,
    })
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary",
    @SlashOption({
      name: "prefix",
      description: "The prefix of the NPC.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.prefix.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.prefix.description},
      type: ApplicationCommandOptionType.String,
    })
    prefix: string,
    @SlashOption({
      name: "image-url",
      description: "The image URL of the NPC.",
      required: true,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.imageUrl.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.imageUrl.description},
      type: ApplicationCommandOptionType.String,
    })
    imageUrl: string,
    @SlashOption({
      name: "icon-url",
      description: "The icon URL of the NPC.",
      required: false,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.iconUrl.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.iconUrl.description},
      type: ApplicationCommandOptionType.String,
    })
    iconUrl: string | null = null,
    @SlashOption({
      name: "description",
      description: "The description of the NPC.",
      required: false,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.description.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.description.description},
      type: ApplicationCommandOptionType.String,
    })
    description: string | null = null,
    @SlashOption({
      name: "title",
      description: "The title of the NPC.",
      required: false,
      nameLocalizations: {"pt-BR": ptBr.commands.createNPC.options.title.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.createNPC.options.title.description},
      type: ApplicationCommandOptionType.String,
    })
    title: string | null = null,
    interaction: ChatInputCommandInteraction,
  ) {
    try {
      await interaction.deferReply({ephemeral: true});
      const npc = await prisma.nPC.create({data: {name, rarity, prefix, imageUrl, iconUrl, description, title}});
      const npcDetails = await getNPCDetails(npc);
      if (!npcDetails) return;

      const imageName = `${lodash.kebabCase(npc.name)}.png`;

      const payload = new AttachmentBuilder(npcDetails.npcImage).setName(imageName);
      const embed = new EmbedBuilder()
        .setTitle(npc.name)
        .setDescription(npc.description)
        .setFields({name: ptBr.npc.prefix, value: npc.prefix, inline: true})
        .setColor(npcDetails.rarityColor)
        .setImage(`attachment://${imageName}`)
        .setFooter({text: npcDetails.footerText});
      if (npc.title) embed.setAuthor({name: npc.title, iconURL: npc.iconUrl ?? undefined});

      await interaction.editReply({content: ptBr.feedback.createNPC.replace("{name}", npc.name), embeds: [embed], files: [payload]});
    } catch (createNPCErrors) {
      console.log("Error creating NPC:", createNPCErrors);
      await interaction.editReply(ptBr.errors.createNPC).catch((error) => "Error sending error feedback: " + error);
    }
  }

  @Slash({
    name: "list-npcs",
    description: "List all NPCs.",
    descriptionLocalizations: {"pt-BR": ptBr.commands.listNPCs.description},
    nameLocalizations: {"pt-BR": ptBr.commands.listNPCs.name},
  })
  async listNPCs(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();
      const npcs = await prisma.nPC.findMany({include: {usersWhoOwn: true}});

      const generatePages = async (npcs: Prisma.NPCGetPayload<{include: {usersWhoOwn: true}}>[]) => {
        return Promise.all(
          npcs.map(async (npc) => {
            const npcDetails = await getNPCDetails(npc);
            if (!npcDetails) return;
            const npcName = lodash.kebabCase(npc.name);
            const attachment = new AttachmentBuilder(npcDetails.npcImage).setName(`${npcName}.png`);
            const embed = new EmbedBuilder()
              .setTitle(npc.name)
              .setFields({name: ptBr.npc.prefix, value: npc.prefix, inline: true})
              .setFields([
                {
                  name: ptBr.npc.owners,
                  value:
                    npc.usersWhoOwn
                      .map((user) => userMention(user.id))
                      .filter(Boolean)
                      .join("\n") ?? ptBr.none,
                  inline: true,
                },
              ])
              .setColor(npcDetails?.rarityColor as ColorResolvable)
              .setDescription(npc.description)
              .setImage(`attachment://${npcName}.png`)
              .setFooter({text: npcDetails.footerText});
            if (npc.title) embed.setAuthor({name: npc.title, iconURL: npc.iconUrl ?? undefined});
            return {embeds: [embed], files: [attachment]};
          }),
        );
      };

      const pagination = new Pagination(interaction, (await generatePages(npcs)).filter(Boolean), {
        ...PAGINATION_DEFAULT_OPTIONS,
        onTimeout: () => interaction.deleteReply().catch((error) => "Error deleting pagination reply: " + error),
      });

      await pagination.send();
    } catch (listNPCsErrors) {
      console.log("Error listing NPCs:", listNPCsErrors);
      interaction.editReply(ptBr.errors.listNPCs).catch((error) => "Error sending error feedback: " + error);
    }
  }
}
