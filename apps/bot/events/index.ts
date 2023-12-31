import {Prisma} from "@prisma/client";
import {spawn} from "child_process";
import {
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonInteraction,
  Colors,
  EmbedBuilder,
  Message,
  PartialMessage,
  channelMention,
  codeBlock,
  userMention,
} from "discord.js";
import {ArgsOf, ButtonComponent, Discord, Guard, On, Once} from "discordx";
import {exists, mkdir, unlink} from "fs/promises";
import JSZip from "jszip";
import lodash from "lodash";
import {DateTime, Duration} from "luxon";
import path from "path";
import ptBr from "translations";
import {cleanImageUrl, credentials, delay} from "utilities";
import {prisma} from "../db";
import {dismissButtonCustomId} from "../lib/components/messagePayloads";
import {isValidRoleplayMessage} from "../lib/guards";
import {getNPCDetails, getUserLevelDetails, sendToImgur} from "../lib/util/helpers";
import {Queue} from "../lib/util/queue";

@Discord()
export class Events {
  private guildInvites: Map<string, {uses: number; maxUses: number | null}>;
  private queue: Queue;
  private timeOuts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.timeOuts = new Map();
    this.guildInvites = new Map();
    this.queue = new Queue();
    this.scheduleToDelete = this.scheduleToDelete.bind(this);
  }

  @On({event: "messageCreate"})
  async onImageVideoMergeRequest([message]: ArgsOf<"messageCreate">) {
    if (!message.attachments.first() || !message.content.includes("youtube.com")) return;
    const cacheFolder = path.resolve(import.meta.dir, "../../cache");

    try {
      if (!exists(cacheFolder)) await mkdir(cacheFolder);
      const loadingMessage = await message.channel.send(ptBr.feedback.loading);
      const attachmentName = lodash.kebabCase(DateTime.now().toMillis() + message.attachments.first()!.name);
      const finalOutputPath = this.createFilePath(cacheFolder, attachmentName, "mp4");
      const audioOutputPath = this.createFilePath(cacheFolder, attachmentName, "mp3");

      await this.executeSpawnProcess("yt-dlp", ["-f", "bestaudio", message.content, "-o", audioOutputPath]);

      const imagePath = await this.saveAttachmentToDisk(cacheFolder, message);
      const duration = await this.getAudioDuration(audioOutputPath);

      await this.mergeImageAndAudio(imagePath, audioOutputPath, duration, finalOutputPath, loadingMessage);

      await loadingMessage.edit({content: ptBr.feedback.loadingDone.replace("{user}", message.author.toString()), files: [finalOutputPath]});

      for (const file of [imagePath, audioOutputPath, finalOutputPath]) await unlink(file);
    } catch (imageVideoMergeError) {
      console.error("Failed to merge image and video", imageVideoMergeError);
      message
        .reply(ptBr.errors.somethingWentWrong)
        .then(this.scheduleToDelete)
        .catch((error) => console.error("Failed to send error message", error));
    }
  }

  @Once({event: "ready"})
  async fetchInvites([client]: ArgsOf<"ready">) {
    try {
      const guild = client.guilds.cache.first();
      if (!guild) return;
      const invites = await guild.invites.fetch({cache: true});
      invites.each((invite) => this.guildInvites.set(invite.code, {uses: invite.uses ?? 0, maxUses: invite.maxUses ?? null}));
    } catch (error) {
      console.error("Failed to fetch invites", error);
    }
  }

  @On({event: "inviteCreate"})
  async inviteCreate([invite]: ArgsOf<"inviteCreate">) {
    try {
      this.guildInvites.set(invite.code, {uses: invite.uses ?? 0, maxUses: invite.maxUses ?? null});
      const inviteGuild = await invite.guild?.fetch();
      const logChannel = inviteGuild?.channels.cache.get(credentials.channels.logChannel);
      if (invite.maxUses && invite.maxUses <= 1) {
        await invite.delete();
        const mentorChannel = inviteGuild?.channels.cache.get(credentials.channels.mentorChannel);
        if (!mentorChannel || !mentorChannel.isTextBased()) return;
        await mentorChannel.send(ptBr.errors.inviteMaxUses.replace("{user}", invite.inviter?.toString() ?? "Unknown").replace("{code}", invite.code));
        return;
      }

      if (!logChannel || !logChannel.isTextBased()) return;
      if (!invite.inviter) return;

      await logChannel.send(
        ptBr.feedback.inviteCreated
          .replace("{user}", invite.inviter.toString())
          .replace("{invite}", invite.code)
          .replace("{uses}", invite.maxUses === 0 ? "∞" : String(invite.maxUses)),
      );
    } catch (error) {
      console.error("Failed to listen to invite create", error);
    }
  }

  @On({event: "inviteDelete"})
  async inviteDelete([invite]: ArgsOf<"inviteDelete">) {
    this.guildInvites.delete(invite.code);
  }

  @On({event: "guildMemberAdd"})
  async guildMemberAdd([member]: ArgsOf<"guildMemberAdd">) {
    try {
      const invites = await member.guild.invites.fetch();
      const invite = invites.find((guildInvite) => {
        const cachedInvite = this.guildInvites.get(guildInvite.code);
        if (!cachedInvite || typeof cachedInvite.uses !== "number" || !guildInvite.uses) return false;
        return cachedInvite.uses < guildInvite.uses;
      });
      if (!invite) return;

      const logChannel = member.guild.channels.cache.get(credentials.channels.logChannel);
      if (!logChannel || !logChannel.isTextBased()) return;

      this.guildInvites.set(invite.code, {uses: invite.uses ?? 0, maxUses: invite.maxUses ?? null});

      await logChannel.send(
        ptBr.feedback.inviteUsed
          .replace("{username}", member.user.username)
          .replace("{code}", invite.code)
          .replace("{inviter}", invite.inviter?.toString() ?? "Unknown"),
      );

      if (!invite.inviter) return;

      const inviterRep = await prisma.user
        .update({where: {id: invite.inviter.id}, data: {reputation: {increment: 1}}})
        .catch((error) => console.error("Failed to update reputation", error));

      if (!inviterRep) return;

      await invite.inviter
        .send(ptBr.feedback.reputationGainedInvite.replace("{amount}", "1").replace("{code}", invite.code).replace("{username}", member.user.username))
        .catch((error) => console.error("Failed to send reputation gained message", error));
    } catch (error) {
      console.error("Failed to listen to guild member add", error);
    }
  }

  @On({event: "guildMemberUpdate"})
  async onMentorRequest([_oldMember, newMember]: ArgsOf<"guildMemberUpdate">) {
    try {
      await newMember.fetch(true);
      await newMember.guild.roles.fetch(undefined, {cache: true, force: true});
      await newMember.guild.members.fetch();
      if (!newMember.roles.cache.has(credentials.roles.pupilRole) || _oldMember.roles.cache.has(credentials.roles.pupilRole)) return;

      const mentorRole = newMember.guild.roles.cache.get(credentials.roles.mentorRole);
      const adminRole = newMember.guild.roles.cache.get(credentials.roles.adminRole);
      if (!mentorRole || !adminRole) return;

      const mentors = mentorRole.members.filter((member) => !member.roles.cache.has(credentials.roles.pupilRole));
      const admins = adminRole.members.filter((member) => !member.roles.cache.has(credentials.roles.pupilRole));
      const possibleMentors = new Set([...mentors.values(), ...admins.values()]);

      const randomMentor = lodash.sample(Array.from(possibleMentors));
      if (!randomMentor) return;

      const mentorChannel = newMember.guild.channels.cache.get(credentials.channels.mentorChannel);
      if (!mentorChannel || !mentorChannel.isTextBased()) return;

      await mentorChannel.send(ptBr.feedback.mentorRequest.replace("{user}", newMember.toString()).replace("{mentor}", randomMentor.toString()));
    } catch (error) {
      console.error("Failed to listen to mentor request", error);
    }
  }

  @On({event: "messageCreate"})
  @Guard(isValidRoleplayMessage)
  async onRoleplayMessage([message]: ArgsOf<"messageCreate">) {
    const isOOC = new RegExp(/^[\[\]\)\(\\\/]/gm).test(message.content.trim());
    if (isOOC) {
      this.scheduleToDelete(message, 5);
      return;
    }

    try {
      const user = await prisma.user.findFirst({where: {id: message.author.id}});

      if (user?.isUsingNPC) {
        const npcs = await prisma.nPC.findMany({where: {usersWhoOwn: {some: {id: message.author.id}}}});
        if (!npcs.length) {
          await message.reply(ptBr.errors.nPCnotFound).then(this.scheduleToDelete);
          return;
        }
        const npcsPrefixes = npcs
          .filter((npc): npc is typeof npc & {prefix: string} => Boolean(npc.prefix))
          .map((npc) => npc.prefix.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"));
        const splitRegex = new RegExp(npcsPrefixes.join("|"), "gm");

        const npcActions = message.content.split(splitRegex).slice(1);
        const npcMatches = message.content.match(splitRegex);

        if (npcMatches) {
          for await (const npcMatch of npcMatches) {
            const npcData = npcs[npcsPrefixes.findIndex((prefix) => prefix === npcMatch)];
            const npcMatchIndex = npcMatches.findIndex((prefix) => prefix === npcMatch);
            const npcAction = npcActions[npcMatchIndex];
            if (!npcAction) continue;

            const npcDetails = await getNPCDetails(npcData);
            const npcEmbed = new EmbedBuilder()
              .setTitle(npcData.name)
              .setColor(npcDetails?.rarityColor ?? "Random")
              .setTimestamp(DateTime.now().toJSDate())
              .setDescription(npcAction)
              .setFooter({text: npcDetails?.footerText ?? ptBr.npc.rarity.common, iconURL: message.guild?.iconURL({size: 128}) ?? undefined})
              .setThumbnail(npcData.imageUrl);
            if (npcData.title) npcEmbed.setAuthor({name: npcData.title, iconURL: npcData.iconUrl ?? undefined});

            const messagePayload = await this.createMessagePayload(npcEmbed, message, npcMatchIndex);
            if (!messagePayload) continue;
            if (!message.attachments?.at(npcMatchIndex)) {
              const embed = messagePayload.embeds?.at(0);
              if (embed) messagePayload.embeds = [EmbedBuilder.from(embed).setImage(null)];
            }
            const sentMessage = await message.channel.send(messagePayload);
            await prisma.message.create({
              data: {id: sentMessage.id, content: message.content, npcId: npcData.id, channelId: message.channel.id, authorId: message.author.id},
            });
          }
          await prisma.channel.update({where: {id: message.channel.id}, data: {lastTimeActive: DateTime.now().toJSDate()}});
        } else {
          await message.reply(ptBr.errors.nPCnotFound).then(this.scheduleToDelete);
        }
        await message.delete().catch((error) => console.error("Failed to delete message", error));
        return;
      }

      const character = await prisma.character.findFirst({where: {isBeingUsed: true, AND: {userId: message.author.id}}, include: {faction: true, user: true}});
      if (!character || character.user.isEditing) {
        return;
      }

      const characterEmbed = new EmbedBuilder()
        .setTitle(`${character.name} ${character.surname}`)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({size: 128}),
        })
        .setDescription(message.content)
        .setThumbnail(character.imageUrl)
        .setColor("Random")
        .setTimestamp(DateTime.now().toJSDate());
      if (character.faction) {
        const emojiId = character.faction?.emoji.split(":")[2].replace(">", "");
        const emojiUrl = message.guild?.emojis.cache.find((emoji) => emoji.id === emojiId)?.url;
        characterEmbed.setFooter({text: `${character.faction.name}`, iconURL: emojiUrl});
      }

      const messagePayload = await this.createMessagePayload(characterEmbed, message);
      if (!messagePayload) return;

      const characterPost = await message.channel.send(messagePayload);

      // I'd prefer to use Promise.all([]) here, but prisma throws an error when you chain its queries in sqlite: https://github.com/prisma/prisma/issues/11789
      await prisma.message.create({
        data: {id: characterPost.id, content: message.content, characterId: character.id, channelId: message.channel.id, authorId: message.author.id},
      });
      await prisma.channel.update({where: {id: characterPost.channel.id}, data: {lastTimeActive: DateTime.now().toJSDate()}});
      await message.delete().catch((error) => console.error("Failed to delete message", error));

      const timeSinceLastXP = DateTime.now().diff(DateTime.fromJSDate(character.user.lastXpTime), "minutes").as("minutes");
      if (timeSinceLastXP < 60) {
        return;
      }
      const random = lodash.random(500, 1000);
      const musicalEmojis = ["🎵", "🎶", "🎼", "🎹", "🎺", "🎸", "🎷", "🥁", "🎻", "🎤", "🎧"];
      const randomMusicalEmoji = lodash.sample(musicalEmojis) ?? "🎵";

      await prisma.user.update({where: {id: character.user.id}, data: {lastXpTime: DateTime.now().toJSDate(), xp: {increment: random}}});

      const userLevelDetails = getUserLevelDetails(character.user);
      const isLevelUp = userLevelDetails.xpToNextLevel <= random;

      if (isLevelUp) {
        const previousRoles = Object.values(credentials.roles.levels).filter((roleId) => roleId !== userLevelDetails.nextRoleId);
        const messageMember = await message.member?.fetch(true);
        if (!messageMember) {
          await message.reply(ptBr.errors.levelUpError).then(this.scheduleToDelete);
          return;
        }
        await messageMember.roles.remove(previousRoles).catch((error) => console.error("Failed to remove previous roles", error));
        await messageMember.roles.add(userLevelDetails.nextRoleId).catch((error) => console.error("Failed to add new role", error));

        const congratulationsMessage = await characterPost.channel.send(
          ptBr.feedback.levelUp.replace("{user}", userMention(character.userId)).replace("{level}", userLevelDetails.nextLevel.toString()),
        );
        musicalEmojis.forEach(
          async (emoji) => await congratulationsMessage.react(emoji).catch((error) => console.error("Failed to react to level up message", error)),
        );
        await characterPost.react(userLevelDetails.nextEmojiId).catch((error) => console.error("Failed to react to level up character post", error));
        return;
      }
      await characterPost.react(randomMusicalEmoji);
    } catch (characterPostError) {
      console.error("Failed to post character message", characterPostError);
    }
  }

  @On({event: "messageReactionAdd"})
  @Guard(isValidRoleplayMessage)
  async onRoleplayReactionAdd([reaction, user]: ArgsOf<"messageReactionAdd">) {
    try {
      const message = await prisma.message.findFirst({where: {id: reaction.message.id}, include: {character: true, hearts: true, author: true}});
      if (!message) return;

      switch (reaction.emoji.name) {
        case "😍":
          const roleplayStarboardChannel = await reaction.message.guild?.channels.fetch(credentials.channels.roleplayStarboard);
          if (!roleplayStarboardChannel || !roleplayStarboardChannel.isTextBased()) return;

          if (message.hearts.find((heartUser) => heartUser.id === user.id)) return;
          let updateArgs: Prisma.MessageUpdateInput = {hearts: {connect: {id: user.id}}};

          const characterPost = await reaction.message.channel.messages.fetch(message.id);

          const reactions = characterPost.reactions.cache.get("😍")?.count ?? 0;

          const starboardMessageContent = {
            content: ptBr.feedback.starboardMessage
              .replace("{count}", String(message.hearts.length + 1))
              .replace("{user}", userMention(message.authorId))
              .replace("{channel}", channelMention(message.channelId)),
          };

          if (!message.starboardMessageId && reactions > 2) {
            const characterPostEmbed = EmbedBuilder.from(characterPost.embeds[0]);
            const starboardMessage = await roleplayStarboardChannel.send({embeds: [characterPostEmbed], ...starboardMessageContent});
            characterPostEmbed.setColor(Colors.Gold);
            await characterPost.edit({
              embeds: [characterPostEmbed],
              content: ptBr.feedback.sentToStarboard
                .replace("{user}", userMention(message.authorId))
                .replace("{channel}", channelMention(roleplayStarboardChannel.id)),
            });
            updateArgs = {...updateArgs, starboardMessageId: starboardMessage.id};
          } else if (message.starboardMessageId) {
            const existingStarboardMessage = await roleplayStarboardChannel.messages.fetch(message.starboardMessageId);
            await existingStarboardMessage.edit(starboardMessageContent);
          }
          await prisma.message.update({where: {id: message.id}, data: {...updateArgs}});

          break;
        case "❌":
          if (message.authorId !== user.id) return;

          await prisma.message.delete({where: {id: message.id}});
          await reaction.message.delete().catch((error) => console.error("Failed to delete message", error));
          break;
        case "✏️":
          if (message.authorId !== user.id) return;

          const editingNotice = await reaction.message.channel.send(ptBr.feedback.editingNotice.replace("{user}", user.toString()));
          this.scheduleToDelete(editingNotice);

          await prisma.user.update({where: {id: user.id}, data: {isEditing: true}});

          const editMessageCollector = reaction.message.channel.createMessageCollector({
            filter: (collectorMessage) => collectorMessage.author.id === user.id,
            time: Duration.fromObject({minutes: 30}).as("milliseconds"),
            max: 1,
          });

          const handleCollectedMessage = async (collectorMessage: Message<boolean>) => {
            try {
              const messageEmbed = EmbedBuilder.from(reaction.message.embeds[0]);
              messageEmbed.setDescription(collectorMessage.content);

              const messagePayload = await this.createMessagePayload(messageEmbed, collectorMessage);
              if (!messagePayload) return;

              await reaction.message.edit(messagePayload);
              await prisma.message.update({where: {id: message.id}, data: {content: collectorMessage.content}});

              reaction.message.reactions.removeAll().catch((error) => console.error("Failed to remove reactions from edited message", error));
              collectorMessage.delete().catch((error) => console.error("Failed to delete message", error));
              editMessageCollector.stop();
            } catch (error) {
              console.error("Failed to edit message", error);
              collectorMessage
                .reply(ptBr.errors.somethingWentWrong)
                .then((message) => this.scheduleToDelete(message))
                .catch((error) => console.error("Failed to send error message", error));
            }
          };

          editMessageCollector.on("end", async (collectedMessages) => {
            const firstMessage = collectedMessages.first();
            if (!firstMessage) return;
            await handleCollectedMessage(firstMessage);
            await prisma.user.update({where: {id: user.id}, data: {isEditing: false}});
          });
          break;
      }
    } catch (error) {
      console.error("Failed to listen to reaction add", error);
    }
  }

  @ButtonComponent({id: dismissButtonCustomId})
  async onDismissButtonClick(interaction: ButtonInteraction) {
    try {
      await interaction.message.delete();
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  }

  @On({event: "messageCreate"})
  async onImageGenerationRequest([message]: ArgsOf<"messageCreate">) {
    if (message.channel.id !== credentials.channels.imageGeneration || message.author.bot) return;
    try {
      const member = await message.member?.fetch(true);
      if (!member) return;

      const isAllowedMember =
        member.roles.cache.has(credentials.roles.adminRole) ||
        member.roles.cache.has(credentials.roles.levels.composerRole) ||
        member.roles.cache.has(credentials.roles.levels.coordinatorRole) ||
        member.premiumSinceTimestamp !== null;
      if (!isAllowedMember) {
        await message.reply(ptBr.errors.imageGenerationNitro).then(this.scheduleToDelete);
        return;
      }

      const isAlreadyInQueue = this.queue.find(message.author.id);
      if (isAlreadyInQueue) {
        const TIME_PER_PERSON = 2 * 60 * 1000;
        const currentPosition = this.queue.findPosition(message.author.id);
        const timeLeft = (this.queue.length - currentPosition) * TIME_PER_PERSON;
        await message
          .reply(
            ptBr.feedback.imageGenerationQueue
              .replace("{time}", Duration.fromMillis(timeLeft).toFormat("mm:ss"))
              .replace("{position}", currentPosition.toString()),
          )
          .then(this.scheduleToDelete);
        return;
      }

      this.queue.enqueue({
        id: message.author.id,
        execute: async () => {
          const loadingMessage = await message.channel.send(ptBr.feedback.loading);
          try {
            await delay(Duration.fromObject({minutes: 2}).as("milliseconds"));
            const input = message.content.trim().split(",");
            const seed = lodash.random(1000000000, 9999999999);
            const isLarge = input.includes("large");
            if (isLarge) input.splice(input.indexOf("large"), 1);

            console.log(`Processing image generation request from ${message.author.username} with input: ${input.join(",")}`);
            const data = {
              input: input.join(","),
              model: "nai-diffusion-2",
              action: "generate",
              parameters: {
                width: isLarge ? 1216 : 832,
                height: isLarge ? 832 : 1216,
                scale: 10,
                sampler: "k_euler_ancestral",
                steps: 28,
                seed,
                n_samples: 1,
                ucPreset: 0,
                qualityToggle: false,
                sm: false,
                sm_dyn: false,
                dynamic_thresholding: false,
                controlnet_strength: 1,
                legacy: false,
                add_original_image: false,
                uncond_scale: 1,
                negative_prompt:
                  "nsfw, lowres, bad, text, error, missing, extra, fewer, cropped, jpeg artifacts, worst quality, bad quality, watermark, displeasing, unfinished, chromatic aberration, scan, scan artifacts",
              },
            };
            const response = await fetch("https://api.novelai.net/ai/generate-image", {
              method: "POST",
              body: JSON.stringify(data),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Bun.env.NOVELAI_TOKEN}`,
              },
            });

            const result = await response.arrayBuffer();
            const zip = new JSZip();
            await zip.loadAsync(result);

            const image = await zip.file(Object.keys(zip.files)[0])?.async("nodebuffer");
            if (!image) {
              await message.reply(ptBr.errors.imageGeneration).then(this.scheduleToDelete);
              return;
            }
            const attachment = new AttachmentBuilder(image).setName(`${input.join(",").slice(0, 80)} s-${seed}.png`);

            await message.channel.send({
              content: ptBr.feedback.imageGenerationDone.replace("{prompt}", codeBlock(input.join(","))).replace("{user}", message.author.toString()),
              files: [attachment],
            });
            console.log(`Image generation request from ${message.author.username} with input: ${input.join(",")} completed`);
          } catch (error) {
            console.error("Failed to generate image", error);
            await message.reply(ptBr.errors.somethingWentWrong).then(this.scheduleToDelete);

            return;
          } finally {
            await loadingMessage.delete().catch((error) => console.error("Failed to delete loading message", error));
          }
        },
      });
    } catch (error) {
      message.reply(ptBr.errors.somethingWentWrong).then(this.scheduleToDelete);
      console.error("Failed to listen to image generation request", error);
    }
  }

  @On({event: "messageCreate"})
  async onUserMention([message]: ArgsOf<"messageCreate">) {
    if (message.mentions.users.size !== 1 || message.author.bot) return;
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return;

      const userData = await prisma.user.findFirst({where: {id: targetUser.id}});
      if (!userData || !userData.afkMessage) return;

      await message
        .reply(ptBr.feedback.afkMessage.triggered.replace("{user}", targetUser.toString()).replace("{message}", userData.afkMessage))
        .then(this.scheduleToDelete);
    } catch (error) {
      console.error("Failed to listen to user mention", error);
    }
  }

  private scheduleToDelete(messageToDelete: Message, minutes = 1) {
    this.timeOuts.set(
      messageToDelete.id,
      setTimeout(() => {
        messageToDelete.delete().catch((error) => console.error("Failed to delete message", error));
        this.timeOuts.delete(messageToDelete.id);
      }, Duration.fromObject({minutes}).as("milliseconds")),
    );
  }

  private async createMessagePayload(embed: EmbedBuilder, message: Message | PartialMessage, attachmentIndex?: number) {
    let messagePayload: BaseMessageOptions = {};
    const attachment = attachmentIndex ? message.attachments.at(attachmentIndex) : message.attachments.first();
    if (attachment?.url) {
      const cleanedUrl = cleanImageUrl(attachment.url);
      const imageLink = await sendToImgur(cleanedUrl!);
      embed.setImage(imageLink);
    }
    messagePayload.embeds = [embed];
    return messagePayload;
  }

  private createFilePath(folder: string, name: string, extension?: string) {
    if (!extension) return path.resolve(folder, name);
    return path.resolve(folder, `${name}.${extension}`);
  }

  private async saveAttachmentToDisk(cacheFolder: string, message: Message) {
    const response = await fetch(message.attachments.first()!.url);
    const imageBuffer = await response.arrayBuffer();
    const imagePath = this.createFilePath(cacheFolder, message.attachments.first()!.name);
    await Bun.write(imagePath, imageBuffer);
    return imagePath;
  }

  private async getAudioDuration(audioPath: string): Promise<number> {
    const result = await this.executeSpawnProcess<number>("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      audioPath,
    ]);
    return parseFloat(result.toString().trim());
  }

  private async mergeImageAndAudio(imagePath: string, audioPath: string, duration: number, outputPath: string, loadingMessage: Message) {
    const BAR_SIZE = 10;
    const MINIMUM_PROGRESS_CHANGE = 10;

    let lastProgress = 0;

    const createProgressBar = (progress: number) => {
      const filledBlocks = Math.round(BAR_SIZE * (progress / 100));
      const emptyBlocks = BAR_SIZE - filledBlocks;

      const filledStr = "🟩".repeat(filledBlocks);
      const emptyStr = "🟥".repeat(emptyBlocks);

      return `[${filledStr}${emptyStr}] ${progress.toFixed(2)}%`;
    };

    const timeToSeconds = (time: string): number => {
      const parts = time.split(":");
      return +parts[0] * 3600 + +parts[1] * 60 + parseFloat(parts[2]);
    };

    const extractCurrentTime = (data: string): number | null => {
      const match = /time=([\d:.]+)/.exec(data);
      if (!match) return null;
      return timeToSeconds(match[1]);
    };

    await this.executeSpawnProcess(
      "ffmpeg",
      [
        "-loop",
        "1",
        "-i",
        imagePath,
        "-i",
        audioPath,
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-c:v",
        "libx264",
        "-vf",
        "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p",
        "-tune",
        "stillimage",
        "-shortest",
        "-movflags",
        "+faststart",
        "-t",
        duration.toString(),
        outputPath,
      ],
      (data) => {
        const currentTime = extractCurrentTime(data.toString());
        if (currentTime !== null) {
          const progress = (currentTime / duration) * 100;
          if (Math.abs(progress - lastProgress) >= MINIMUM_PROGRESS_CHANGE) {
            lastProgress = progress;
            loadingMessage.edit(createProgressBar(progress)).catch((error) => console.error("Failed to edit loading message", error));
          }
        }
      },
    );
  }

  private async executeSpawnProcess<T>(command: string, args: string[], loadingCallback?: (data: string) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let data = "";
      process.stdout.on("data", (chunk) => (data = chunk));
      process.stderr.on("data", (data) => {
        if (command === "ffmpeg") loadingCallback?.(data.toString());
      });
      process.on("close", () => resolve(data as T));
      process.on("error", reject);
    });
  }
}
