import {ButtonInteraction, CommandInteraction, StringSelectMenuInteraction} from "discord.js";
import {Duration} from "luxon";

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
