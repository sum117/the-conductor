import {Prisma} from "@prisma/client";
import {ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits} from "discord.js";
import {Discord, Slash, SlashOption} from "discordx";
import {prisma} from "../db";
import {
  entityCreatorFactionFields,
  entityCreatorFactionModal,
  entityCreatorInstrumentFields,
  entityCreatorInstrumentModal,
  entityCreatorRaceFields,
  entityCreatorRaceModal,
} from "../lib/components/modals";
import {awaitSubmitModal, getSafeKeys} from "../lib/util/helpers";
import {ptBr} from "../translations/ptBr";
@Discord()
export class EntityCreator {
  @Slash({
    name: "entity-creator",
    description: "Creates a new entity in the server.",
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    nameLocalizations: {"pt-BR": ptBr.commands.entityCreator.name},
    descriptionLocalizations: {"pt-BR": ptBr.commands.entityCreator.description},
  })
  async entityCreator(
    @SlashOption({
      name: "entity-type",
      description: "The type of entity to create.",
      nameLocalizations: {"pt-BR": ptBr.commands.entityCreator.options.entityType.name},
      descriptionLocalizations: {"pt-BR": ptBr.commands.entityCreator.options.entityType.description},
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete(interaction) {
        interaction
          .respond([
            {name: "race", value: "race", nameLocalizations: {"pt-BR": ptBr.commands.entityCreator.autocomplete.race}},
            {name: "instrument", value: "instrument", nameLocalizations: {"pt-BR": ptBr.commands.entityCreator.autocomplete.instrument}},
            {name: "faction", value: "faction", nameLocalizations: {"pt-BR": ptBr.commands.entityCreator.autocomplete.faction}},
          ])
          .catch(console.log);
      },
    })
    entityType: "race" | "instrument" | "faction",
    interaction: CommandInteraction,
  ) {
    try {
      const modalMap = {
        race: entityCreatorRaceModal(),
        instrument: entityCreatorInstrumentModal(),
        faction: entityCreatorFactionModal(),
      };
      const fieldMap = {
        race: entityCreatorRaceFields,
        instrument: entityCreatorInstrumentFields,
        faction: entityCreatorFactionFields,
      };

      const modal = modalMap[entityType];

      await interaction.showModal(modal);
      const submission = await awaitSubmitModal(interaction);
      const fields = getSafeKeys(fieldMap[entityType]).reduce(
        (acc, key) => {
          acc[key] = submission.fields.getTextInputValue(key);
          return acc;
        },
        <Prisma.InstrumentCreateWithoutCharactersInput | Prisma.RaceCreateWithoutCharactersInput | Prisma.FactionCreateWithoutCharactersInput>{},
      );

      const entity = await this.createEntity(entityType, fields);
      await submission.editReply({content: ptBr.feedback.entityCreated[entityType].replace("{name}", entity.name)});
    } catch (entityCreationError) {
      console.log(entityCreationError);
      interaction.editReply({content: ptBr.errors.entityCreationError}).catch(console.log);
    }
  }

  private createEntity(
    entityType: "race" | "instrument" | "faction",
    fields: Prisma.InstrumentCreateWithoutCharactersInput | Prisma.RaceCreateWithoutCharactersInput | Prisma.FactionCreateWithoutCharactersInput,
  ) {
    switch (entityType) {
      case "race":
        return prisma.race.create({data: fields});
      case "instrument":
        return prisma.instrument.create({data: fields});
      case "faction":
        if (!("emoji" in fields)) {
          throw new Error("Missing emoji field.");
        }
        return prisma.faction.create({data: fields});
      default:
        throw new Error("Invalid entity type.");
    }
  }
}
