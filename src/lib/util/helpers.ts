import {Instrument, User} from "@prisma/client";
import {
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
  GuildTextBasedChannel,
  StringSelectMenuInteraction,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import lodash from "lodash";
import {Duration} from "luxon";
import {credentials} from "../../data/credentials";
import {prisma} from "../../db";
import {ptBr} from "../../translations/ptBr";

export function cleanImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
  } catch {
    console.error("Invalid URL provided:", url);
    return null;
  }
}

/**
 * Awaits a modal submission from the user who triggered the interaction.
 * @param interaction The interaction to await a modal submission from.
 * @returns A deferred reply to the modal submission. You must edit this reply to send a message to the user if you want to.
 */
export async function awaitSubmitModal(interaction: ButtonInteraction | CommandInteraction | StringSelectMenuInteraction) {
  const submitted = await interaction.awaitModalSubmit({
    time: Duration.fromObject({hours: 1}).as("milliseconds"),
    filter: (submitInteraction) => submitInteraction.user.id === interaction.user.id,
  });
  await submitted.deferReply({ephemeral: true});
  return submitted;
}

export function getSafeKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}

export function getSanitizedChannelName(channel: GuildTextBasedChannel): string {
  return lodash.startCase(channel.name.slice(channel.name.indexOf("┊") + 1).trim());
}

export function getUserLevelDetails(user: User) {
  const userLevel = Math.max(1, Math.floor(user.xp / 10000));
  const percentageToNextLevel = (user.xp % 10000) / 100;
  const xpToNextLevel = 10000 - (user.xp % 10000);

  const levelCaps = [
    {maxLevel: 2, emojiId: credentials.levelEmojiIds.student, roleId: credentials.roles.levels.studentRole},
    {maxLevel: 4, emojiId: credentials.levelEmojiIds.tuner, roleId: credentials.roles.levels.tunerRole},
    {maxLevel: 6, emojiId: credentials.levelEmojiIds.coralist, roleId: credentials.roles.levels.coralistRole},
    {maxLevel: 8, emojiId: credentials.levelEmojiIds.instrumentalist, roleId: credentials.roles.levels.instrumentalistRole},
    {maxLevel: 10, emojiId: credentials.levelEmojiIds.improviser, roleId: credentials.roles.levels.improviserRole},
    {maxLevel: 12, emojiId: credentials.levelEmojiIds.arranger, roleId: credentials.roles.levels.arrangerRole},
    {maxLevel: 13, emojiId: credentials.levelEmojiIds.concertArtist, roleId: credentials.roles.levels.concertArtistRole},
    {maxLevel: 14, emojiId: credentials.levelEmojiIds.virtuous, roleId: credentials.roles.levels.virtuousRole},
    {maxLevel: 15, emojiId: credentials.levelEmojiIds.composer, roleId: credentials.roles.levels.composerRole},
    {maxLevel: Infinity, emojiId: credentials.levelEmojiIds.coordinator, roleId: credentials.roles.levels.coordinatorRole},
  ];

  let emojiId = "";
  let roleId = "";
  let nextEmojiId = "";
  let nextRoleId = "";
  for (const levelCap of levelCaps) {
    if (userLevel <= levelCap.maxLevel) {
      emojiId = levelCap.emojiId;
      roleId = levelCap.roleId;
      nextRoleId = levelCaps[levelCaps.indexOf(levelCap) + 1]?.roleId;
      nextEmojiId = levelCaps[levelCaps.indexOf(levelCap) + 1]?.emojiId;
      break;
    }
  }

  return {
    userLevel,
    emojiId,
    roleId,
    percentageToNextLevel,
    xpToNextLevel,
    nextLevel: userLevel + 1,
    nextEmojiId,
    nextRoleId,
  };
}

export async function recursivelyDelete(channel: TextChannel) {
  const messages = await channel.messages.fetch().catch(() => null);
  if (messages && messages.size > 0) {
    await channel.bulkDelete(messages).catch((error) => console.error("Error deleting messages in bulk", error));
    await recursivelyDelete(channel);
  }
}

export async function processInstruments(instrumentsChannel: TextBasedChannel) {
  const instrumentEmbed = (instrument: Instrument) => {
    const embed = new EmbedBuilder()
      .setTitle(instrument.name)
      .setDescription(instrument.description)
      .setThumbnail(instrument.imageUrl)
      .setColor("Random")
      .setFields([{name: ptBr.embeds.beginnerInstrument, value: instrument.isBeginner ? "✅" : "❌"}]);

    return embed;
  };

  const sendMessageAndUpdateInstrument = async (instrument: Instrument, instrumentsChannel: TextBasedChannel) => {
    const message = await instrumentsChannel.send({embeds: [instrumentEmbed(instrument)]});
    await prisma.instrument.update({where: {id: instrument.id}, data: {messageId: message.id}});
  };

  const instruments = await prisma.instrument.findMany();
  for (const instrument of instruments) {
    if (!instrument.messageId) {
      await sendMessageAndUpdateInstrument(instrument, instrumentsChannel);
    } else {
      const instrumentMessage = await instrumentsChannel.messages.fetch(instrument.messageId).catch(() => null);
      if (!instrumentMessage) {
        await sendMessageAndUpdateInstrument(instrument, instrumentsChannel);
      }
    }
  }
}
