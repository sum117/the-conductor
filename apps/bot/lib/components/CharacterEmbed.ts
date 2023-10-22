import {Character, Prisma} from "@prisma/client";
import {BaseMessageOptions, EmbedBuilder, roleMention, userMention} from "discord.js";
import ptBr from "translations";
import {credentials, getSafeKeys, hasKey} from "utilities";
import {createCharacterEvaluationButtonRow} from "../../commands/submission";

interface CharacterPayloadOptions extends BaseMessageOptions {
  character?: Prisma.CharacterGetPayload<{include: {faction: true; race: true}}>;
}
export class CharacterPayload {
  public embeds?: BaseMessageOptions["embeds"];
  public components?: BaseMessageOptions["components"];
  public files?: BaseMessageOptions["files"];
  public character?: Character;
  public content?: BaseMessageOptions["content"];

  constructor(
    public payload: CharacterPayloadOptions = {
      embeds: [],
      components: [],
      files: [],
      character: undefined,
      content: undefined,
    },
  ) {
    if (this.payload.character) {
      this.payload.embeds = new Array<EmbedBuilder>();
      const characterEmbed = new EmbedBuilder();
      characterEmbed.setDescription(this.payload.character.backstory);
      characterEmbed.setTitle(`${this.payload.character.name} ${this.payload.character.surname}`);
      characterEmbed.setImage(this.payload.character.imageUrl);
      characterEmbed.setColor("Random");
      characterEmbed.setFooter({text: ptBr.createCharacter.websiteCharFooterText});
      getSafeKeys(this.payload.character)
        .filter((key) => {
          const value = this.payload.character?.[key];
          return Boolean(value);
        })
        .forEach((key) => {
          if (key === "factionId" && this.payload.character?.faction) {
            characterEmbed.addFields([
              {name: ptBr.character.faction, value: `${this.payload.character.faction?.emoji} ${this.payload.character?.faction?.name}`},
            ]);
            return;
          } else if (key === "raceId" && this.payload?.character?.race) {
            characterEmbed.addFields([{name: ptBr.character.race, value: this.payload.character.race.name}]);
            return;
          }
          if (!hasKey(ptBr.character, key) || key === "backstory" || key === "imageUrl" || key === "userId" || key === "faction" || key === "race") return;

          characterEmbed.addFields([{name: ptBr.character[key], value: this.payload.character?.[key] ?? ptBr.noneF}]);
        });
      this.payload.embeds.push(characterEmbed);

      this.payload.components = [createCharacterEvaluationButtonRow(this.payload.character.id)];
      this.payload.content = ptBr.feedback.evaluation.waiting
        .replace("{user}", userMention(this.payload.character.userId))
        .replace("{mention}", roleMention(credentials.roles.adminRole));
    }

    this.embeds = this.payload.embeds;
    this.components = this.payload.components;
    this.files = this.payload.files;
    this.character = this.payload.character;
    this.content = this.payload.content;
    return this;
  }
}
