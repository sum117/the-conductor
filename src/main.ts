import {dirname, importx} from "@discordx/importer";
import {ChannelType, GuildTextBasedChannel, IntentsBitField, Interaction, Message} from "discord.js";
import {Client} from "discordx";
import cron from "node-cron";
import {credentials} from "./data/credentials";
import {prisma} from "./db";
import {processInstruments, processRoleplayChannel, recursivelyDelete} from "./lib/util/helpers";
import app from "./server";
import {ptBr} from "./translations/ptBr";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Make sure all users aren't stuck in editing mode in case of a crash
  await prisma.user.updateMany({data: {isEditing: false}});

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );
  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  bot.executeCommand(message);
});

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }
  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);

  // Start the webserver for SVG profile cards
  app.listen(8080);
  console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

  // run every day at 00:00 to delete all the messages in the club channel and delete messages that doesn't exist in the server anymore from the database.
  cron.schedule(
    "0 0 * * *",
    async () => {
      async function handleClubChannel() {
        try {
          const clubChannel = await bot.channels.fetch(credentials.channels.clubChat);
          if (clubChannel?.type !== ChannelType.GuildText) return;

          await recursivelyDelete(clubChannel);
          await clubChannel.send(ptBr.feedback.clubChatCleared);
        } catch (error) {
          console.error("Error handling club channel:", error);
        }
      }

      async function handleInstrumentsChannel() {
        try {
          const instrumentsChannel = await bot.channels.fetch(credentials.channels.instrumentsChannel);
          if (instrumentsChannel?.type !== ChannelType.GuildText) return;

          await processInstruments(instrumentsChannel);
        } catch (error) {
          console.error("Error handling instruments channel:", error);
        }
      }

      async function handleMessages(channel: GuildTextBasedChannel) {
        try {
          const messages = await prisma.message.findMany({where: {channelId: channel.id}});
          if (!messages) return;

          await Promise.all(
            messages.map(async (message) => {
              const discordMessage = await channel.messages.fetch(message.id);
              if (!discordMessage) await prisma.message.delete({where: {id: message.id}});
            }),
          );
        } catch (error) {
          console.error(`Error handling messages for channel with ID ${channel.id}:`, error);
        }
      }

      async function mainRoutine() {
        await handleClubChannel();
        await handleInstrumentsChannel();

        for (const [_channelId, channel] of bot.channels.cache.entries()) {
          if (channel.type !== ChannelType.GuildText) continue;
          await handleMessages(channel);
        }
      }

      mainRoutine();
    },
    {timezone: "America/Sao_Paulo", runOnInit: true},
  );

  cron.schedule(
    "0 */2 * * *",
    async () => {
      for (const [_channelId, channel] of bot.channels.cache.entries()) {
        if (channel.type !== ChannelType.GuildText) continue;
        const isFirstInCategory = channel.parent?.children.cache.at(0)?.id === channel.id;
        if ((channel.parent?.name.startsWith("RP") && !isFirstInCategory) || channel.id === credentials.channels.randomRoleplay)
          await processRoleplayChannel(channel);
      }
    },
    {timezone: "America/Sao_Paulo", runOnInit: false},
  );
}

run();
