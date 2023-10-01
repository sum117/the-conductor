import {spawn} from "child_process";
import {AttachmentBuilder, BaseMessageOptions, EmbedBuilder, Message, PartialMessage} from "discord.js";
import {ArgsOf, Discord, Guard, On} from "discordx";
import {exists, mkdir, unlink} from "fs/promises";
import lodash from "lodash";
import {DateTime, Duration} from "luxon";
import path from "path";
import {credentials} from "../data/credentials";
import {prisma} from "../db";
import {isValidRoleplayMessage} from "../lib/guards";
import {cleanImageUrl, getUserLevelDetails} from "../lib/util/helpers";
import {ptBr} from "../translations/ptBr";
@Discord()
export class Events {
  private timeOuts: Map<string, NodeJS.Timeout> = new Map();

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

  @On({event: "messageCreate"})
  @Guard(isValidRoleplayMessage)
  async onRoleplayMessage([message]: ArgsOf<"messageCreate">) {
    const isOOC = new RegExp(/^[\[\]\)\(\\\/]/gm).test(message.content.trim());
    if (isOOC) {
      this.scheduleToDelete(message, 5);
      return;
    }

    try {
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

      const messagePayload = this.createMessagePayload(characterEmbed, message);
      if (!messagePayload) return;

      const characterPost = await message.channel.send(messagePayload);
      await prisma.message.create({data: {id: characterPost.id, content: message.content, characterId: character.id, channelId: message.channel.id}});
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
        await message.member?.roles.remove(previousRoles).catch((error) => console.error("Failed to remove previous roles", error));
        await message.member?.roles.add(userLevelDetails.nextRoleId).catch((error) => console.error("Failed to add new role", error));

        const congratulationsMessage = await characterPost.channel.send(
          ptBr.feedback.levelUp.replace("{user}", character.user.toString()).replace("{level}", userLevelDetails.nextLevel.toString()),
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
  async onReactionEditDeleteAction([reaction, user]: ArgsOf<"messageReactionAdd">) {
    try {
      const message = await prisma.message.findFirst({where: {id: reaction.message.id}, include: {character: true}});
      if (!message || message.character.userId !== user.id) {
        return;
      }

      switch (reaction.emoji.name) {
        case "❌":
          await prisma.message.delete({where: {id: message.id}});
          await reaction.message.delete().catch((error) => console.error("Failed to delete message", error));
          break;
        case "✏️":
          const editingNotice = await reaction.message.channel.send(ptBr.feedback.editingNotice.replace("{user}", user.toString()));
          this.scheduleToDelete(editingNotice);

          await prisma.user.update({where: {id: user.id}, data: {isEditing: true}});

          const editMessageCollector = reaction.message.channel.createMessageCollector({
            filter: (collectorMessage) => collectorMessage.author.id === user.id,
            time: Duration.fromObject({minutes: 30}).as("milliseconds"),
            max: 1,
          });

          editMessageCollector.on("collect", async (collectorMessage) => {
            try {
              const messageEmbed = EmbedBuilder.from(reaction.message.embeds[0]);
              messageEmbed.setDescription(collectorMessage.content);

              const messagePayload = this.createMessagePayload(messageEmbed, collectorMessage);
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
          });

          editMessageCollector.on("end", async () => {
            await prisma.user.update({where: {id: user.id}, data: {isEditing: false}});
          });
          break;
      }
    } catch (error) {
      console.error("Failed to listen to reaction add", error);
    }
  }

  private scheduleToDelete(messageToDelete: Message, minutes = 1) {
    this.timeOuts.set(
      messageToDelete.id,
      setTimeout(() => {
        messageToDelete.delete().catch((error) => console.error("Failed to delete editing notice", error));
        this.timeOuts.delete(messageToDelete.id);
      }, Duration.fromObject({minutes}).as("milliseconds")),
    );
  }

  private createMessagePayload(embed: EmbedBuilder, message: Message | PartialMessage) {
    let messagePayload: BaseMessageOptions = {};
    const attachment = message.attachments.first();
    if (attachment?.url) {
      const cleanedUrl = cleanImageUrl(attachment.url);
      const fileName = cleanedUrl?.split("/").pop();
      if (!fileName || !cleanedUrl) return;

      const newAttachment = new AttachmentBuilder(cleanedUrl).setName(fileName);
      embed.setImage("attachment://" + fileName);
      console.log(embed.data.image);
      messagePayload.files = [newAttachment];
    }
    messagePayload.embeds = [embed];
    return messagePayload;
  }

  private createFilePath(folder: string, name: string, extension: string) {
    return path.resolve(folder, `${name}.${extension}`);
  }

  private async saveAttachmentToDisk(cacheFolder: string, message: Message) {
    const response = await fetch(message.attachments.first()!.url);
    const imageBuffer = await response.arrayBuffer();
    const imagePath = this.createFilePath(cacheFolder, message.attachments.first()!.name, "png");
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
