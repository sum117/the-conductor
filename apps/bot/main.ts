import {dirname, importx} from "@discordx/importer";
import {ChannelType, EmbedBuilder, GuildTextBasedChannel, IntentsBitField, Interaction, Message, Partials} from "discord.js";
import {Client} from "discordx";
import cron from "node-cron";
import ptBr from "translations";
import {credentials} from "utilities";
import {prisma} from "./db";
import {processInstruments, processRoleplayChannel, recursivelyDelete} from "./lib/util/helpers";
import elysiaServer from "./server";
import {Prisma} from "@prisma/client";
import lodash from "lodash";

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
    IntentsBitField.Flags.GuildInvites,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

// I've made this function because of a database emergency. This should be removed in the future.
async function createCharacterFromMessage(message: Message) {
  type DiscordEmbedField = {name: string; value: string; inline: boolean};
  const getFieldByName = (fields: Array<DiscordEmbedField>, name: string) => fields?.find((field) => field.name === name)?.value;

  const getUserIdFromContent = (content: string) => {
    const match = content.match(/<@!?(\d+)>/);
    return match ? match[1] : null;
  };

  const hasFields = (fields: unknown): fields is Array<DiscordEmbedField> =>
    Array.isArray(fields) && fields.every((field) => typeof field === "object" && field && "name" in field && "value" in field) && fields?.length > 0;

  const [allRaces, allInstruments, allFactions] = await Promise.all([prisma.race.findMany(), prisma.instrument.findMany(), prisma.faction.findMany()]);
  if (!message.embeds.length) throw new Error("No embeds in message");

  const characterSheet = EmbedBuilder.from(message.embeds[0]);

  const fields = characterSheet.data.fields;
  if (!hasFields(fields)) throw new Error("No fields in embed");

  const [firstName, surname] = characterSheet.data.title?.split(" ") ?? [];

  const raceId = allRaces.find((race) => race.name === getFieldByName(fields, "Raça"))?.id;
  const sanitizedFactionName = getFieldByName(fields, "Facção")?.split(" ").slice(1).join(" ");
  console.log(sanitizedFactionName);
  const factionId = allFactions.find((faction) => faction.name === sanitizedFactionName)?.id;

  const userId = getUserIdFromContent(message.content);
  if (!userId) throw new Error("User ID not found in message content");

  const user = await prisma.user.findUnique({where: {id: userId}, include: {characters: true}});
  const hasCharacters = user?.characters?.length && user?.characters?.length > 0;
  if (hasCharacters) throw new Error("User already has a character");

  const character: Prisma.CharacterCreateInput = {
    name: firstName,
    surname,
    backstory: characterSheet.data.description,
    age: getFieldByName(fields, "Idade"),
    personality: getFieldByName(fields, "Personalidade"),
    race: {connect: {id: raceId}},
    user: {connectOrCreate: {where: {id: userId}, create: {id: userId}}},
    appearance: getFieldByName(fields, "Aparência"),
    height: getFieldByName(fields, "Altura"),
    weight: getFieldByName(fields, "Peso"),
    gender: getFieldByName(fields, "Gênero"),
    faction: factionId ? {connect: {id: factionId}} : undefined,
    imageUrl: characterSheet.data.image?.url,
    slug: lodash.kebabCase(characterSheet.data.title ?? ""),
    isBeingUsed: true,
    isPending: false,
    instruments: {create: {quantity: 1, instrument: {connect: {id: lodash.sample(allInstruments)?.id}}}},
  };

  if (!character.name || !character.surname) throw new Error("Character name or surname not found");

  return prisma.character.create({data: character});
}

bot.once("ready", async (client) => {
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

  const sheetsChannel = await client.channels.fetch(credentials.channels.approvedChannel);
  if (!sheetsChannel?.isTextBased()) return;

  const sheets = await sheetsChannel.messages.fetch({limit: 100});

  for (const sheet of sheets.values()) {
    try {
      await createCharacterFromMessage(sheet);
    } catch (error) {
      console.error("Error creating character from message:", error);
    }
  }

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
  if (!Bun.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }
  // Log in with your bot token
  await bot.login(Bun.env.BOT_TOKEN);

  // Start the webserver for SVG profile cards
  elysiaServer.listen(8080);
  console.log(`Elysia is running at ${elysiaServer.server?.hostname}:${elysiaServer.server?.port}`);

  // run every day at 00:00 to delete all the messages in the club channel and delete messages that doesn't exist in the server anymore from the database.
  if (Bun.env.NODE_ENV !== "development") {
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
                const discordMessage = await channel.messages.fetch(message.id).catch(() => null);
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
          const isFirstInCategory = channel.name.includes("📖");
          if ((channel.parent?.name.startsWith("RP") && !isFirstInCategory) || channel.id === credentials.channels.randomRoleplay)
            await processRoleplayChannel(channel);
        }
      },
      {timezone: "America/Sao_Paulo", runOnInit: false},
    );
  }
}

run();
