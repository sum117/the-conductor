import {BaseMessageOptions, MessageMentionOptions} from "discord.js";

export class CharacterPayload implements BaseMessageOptions {
  allowedMentions?: MessageMentionOptions | undefined;
}
