import {ChannelType, Message} from "discord.js";
import {ArgsOf, GuardFunction} from "discordx";
import {credentials} from "../../data/credentials";

export const isValidRoleplayMessage: GuardFunction<ArgsOf<"messageCreate" | "messageReactionAdd">> = async ([messageOrReaction], _client, next) => {
  const channel = messageOrReaction instanceof Message ? messageOrReaction.channel : messageOrReaction.message.channel;
  const author = messageOrReaction instanceof Message ? messageOrReaction.author : messageOrReaction.message.author;

  if (channel.type !== ChannelType.GuildText || author?.bot) return;
  const isRoleplayingChannel = channel.parent?.name.startsWith("RP") || credentials.channels.randomRoleplay === channel.id;
  if (!isRoleplayingChannel) {
    return;
  }

  await next();
};
