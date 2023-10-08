import {ChannelType, Message} from "discord.js";
import {ArgsOf, GuardFunction} from "discordx";
import {credentials} from "utilities";

export const isValidRoleplayMessage: GuardFunction<ArgsOf<"messageCreate" | "messageReactionAdd">> = async ([messageOrReaction], _client, next) => {
  const channel = messageOrReaction instanceof Message ? messageOrReaction.channel : messageOrReaction.message.channel;
  const isBot = messageOrReaction instanceof Message ? messageOrReaction.author?.bot : messageOrReaction.me;

  if (channel.type !== ChannelType.GuildText || isBot) return;
  const isRoleplayingChannel = channel.parent?.name.startsWith("RP") || credentials.channels.randomRoleplay === channel.id;
  if (!isRoleplayingChannel) {
    return;
  }

  await next();
};
