import {Instrument, NPC, User} from "@prisma/client";
import {
  ButtonInteraction,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildTextBasedChannel,
  StringSelectMenuInteraction,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import lodash from "lodash";
import {DateTime, Duration} from "luxon";
import sharp from "sharp";
import ptBr from "translations";
import {credentials} from "utilities";
import {MUDAE_IMAGE_HEIGHT, MUDAE_IMAGE_WIDTH} from "../../data/constants";
import {prisma} from "../../db";
import {makeRoleplayingPlaceholderPayload} from "../components/messagePayloads";

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

export async function getNPCDetails(npc: NPC) {
  if (!npc.rarity) return;

  const colorMap = {
    common: Colors.Blue,
    uncommon: Colors.Green,
    rare: Colors.Blurple,
    epic: Colors.Red,
    legendary: Colors.Gold,
  };

  const npcImageResized = await changeImageResolution(npc.imageUrl, MUDAE_IMAGE_WIDTH, MUDAE_IMAGE_HEIGHT);

  const toRGB = (color: (typeof colorMap)[keyof typeof colorMap]) => {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    return {r, g, b};
  };

  const rarityColor = colorMap[npc.rarity as keyof typeof colorMap];

  const npcImageWithBorders = await sharp(npcImageResized)
    .extend({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      background: toRGB(rarityColor),
    })
    .png()
    .toBuffer();

  return {
    rarityColor,
    npcImage: npcImageWithBorders,
    footerText: ptBr.npc.rarity[npc.rarity as keyof typeof colorMap],
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

export async function processRoleplayChannel(channel: GuildTextBasedChannel) {
  try {
    let channelData = await prisma.channel.findUnique({where: {id: channel.id}});

    if (!channelData) {
      const sanitizedChannelName = getSanitizedChannelName(channel);
      channelData = await prisma.channel.create({data: {id: channel.id, name: sanitizedChannelName}});
      const placeholderMessage = await channel.send(makeRoleplayingPlaceholderPayload(channel, channelData));
      await prisma.channel.update({
        data: {...channelData, placeholderMessageId: placeholderMessage.id, lastTimeActive: DateTime.now().toJSDate()},
        where: {id: channelData.id},
      });
    } else {
      const hasBeenTwoHoursInactive = DateTime.now().diff(DateTime.fromJSDate(channelData.lastTimeActive)).as("hours") >= 2;
      if (hasBeenTwoHoursInactive) {
        const placeholderMessage = channelData.placeholderMessageId ? await channel.messages.fetch(channelData.placeholderMessageId).catch(() => null) : null;
        if (placeholderMessage) await placeholderMessage.delete().catch((error) => console.error("Error deleting placeholder message", error));

        const newPlaceholderMessage = await channel.send(makeRoleplayingPlaceholderPayload(channel, channelData));
        await prisma.channel.update({
          data: {...channelData, placeholderMessageId: newPlaceholderMessage.id, lastTimeActive: DateTime.now().toJSDate()},
          where: {id: channelData.id},
        });
      }
    }
  } catch (error) {
    console.error(`Error processing roleplay channel with ID ${channel.id}:`, error);
  }
}

export async function changeImageResolution(imageUrl: string, width: number, height: number) {
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const resizedBuffer = await sharp(buffer).resize({width: width, height: height, fit: "cover", position: "top"}).png().toBuffer();

  return resizedBuffer;
}
