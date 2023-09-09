import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent as ButtonComponentType,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {ButtonComponent, Discord, Slash} from "discordx";
import {Duration} from "luxon";
import {submissionAppearanceModal, submissionEssentialsModal} from "../lib/components/modals";
import {User} from "../lib/structs/User";
import {imageLinks} from "../lib/util/assets";
import {ptBr} from "../lib/util/translation";

const createCharacterPopupButtonId = "createCharacter";
const createCharacterEssentialsButtonId = "createCharacterEssentials";
const createCharacterAppearanceButtonId = "createCharacterAppearance";
const createCharacterSendButtonId = "createCharacterSend";

@Discord()
export class Submission {
  @ButtonComponent({
    id: createCharacterAppearanceButtonId,
  })
  public async buttonCreateCharacterAppearance(interaction: ButtonInteraction) {
    const user = await this.getUser(interaction);
    if (user) this.handleModalInteraction(interaction, user, "appearance");
  }

  @ButtonComponent({
    id: createCharacterEssentialsButtonId,
  })
  public async buttonCreateCharacterEssentials(interaction: ButtonInteraction) {
    const user = await this.getUser(interaction);
    if (user) this.handleModalInteraction(interaction, user, "essentials");
  }

  @ButtonComponent({
    id: createCharacterPopupButtonId,
  })
  public async buttonCreateCharacter(interaction: ButtonInteraction) {
    await interaction.deferReply({ephemeral: true});

    try {
      const user = await this.getOrCreateUser(interaction);
      await user.deletePendingCharacters();
      await user.createCharacter({isPending: true});
      await interaction.editReply({
        embeds: [this.createCharacterEmbed()],
        components: [this.createCharacterButtonRow()],
      });
    } catch (error) {
      console.error("Error creating character popup: ", error);
    }
  }

  @Slash({
    name: "create-character-modal",
    description: "Creates a character submission embed",
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    nameLocalizations: {"pt-BR": ptBr.commands.submission.name},
    descriptionLocalizations: {"pt-BR": ptBr.commands.submission.description},
  })
  public async submission(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.reply({
        embeds: [this.createSubmissionEmbed()],
        components: [this.createSubmissionButtonRow()],
      });
    } catch (error) {
      console.error("Error sending submission embed: ", error);
    }
  }

  private async handleModalInteraction(
    interaction: ButtonInteraction,
    user: User,
    type: "appearance" | "essentials" | "send",
  ) {
    try {
      const character = await this.getCharacter(user);
      const awaitSubmitModal = async () => {
        const submitted = await interaction.awaitModalSubmit({
          time: Duration.fromObject({hours: 1}).as("milliseconds"),
          filter: (submitInteraction) => submitInteraction.user.id === interaction.user.id,
        });
        await submitted.deferReply({ephemeral: true});
        return submitted;
      };

      switch (type) {
        case "essentials":
          await interaction.showModal(submissionEssentialsModal(character));
          const essentialsSubmitted = await awaitSubmitModal();

          const [name, surname, personality, backstory, age] = [
            "name",
            "surname",
            "personality",
            "backstory",
            "age",
          ].map((key) => essentialsSubmitted.fields.getTextInputValue(key));

          const essentialsEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
          essentialsEmbed.setDescription(backstory);
          essentialsEmbed.setTitle(`${name} ${surname}`);
          essentialsEmbed.setFields([
            {
              name: ptBr.character.age,
              value: age.toString(),
            },
            {
              name: ptBr.character.personality,
              value: personality,
            },
          ]);

          const essentialsButtons = interaction.message.components[0].components
            .filter((component): component is ButtonComponentType => component.type === ComponentType.Button)
            .map((component) => {
              const newButton = ButtonBuilder.from(component);
              newButton.setDisabled(false);
              return newButton;
            });

          await interaction.editReply({
            embeds: [essentialsEmbed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...essentialsButtons)],
          });

          await essentialsSubmitted.editReply({
            content: ptBr.feedback.essentials.submitted,
          });

          const essentialsData = await Promise.allSettled([
            user?.setCharacterField(character.id, "name", name),
            user?.setCharacterField(character.id, "surname", surname),
            user?.setCharacterField(character.id, "personality", personality),
            user?.setCharacterField(character.id, "backstory", backstory),
            user?.setCharacterField(character.id, "age", age),
          ]);

          essentialsData
            .filter((promise) => promise.status === "rejected")
            .forEach((promise) => {
              console.error("Error submitting essentials modal field: ", promise);
            });
          break;

        case "appearance":
          await interaction.showModal(submissionAppearanceModal(character));
          const appearanceSubmitted = await awaitSubmitModal();
          // TODO: Implement appearance modal submit logic
          break;

        case "send":
          // TODO: Implement the "send" case logic
          break;

        default:
          console.warn(`Unsupported type: ${type}`);
          break;
      }
    } catch (error) {
      console.error(`Error creating character ${type} modal: `, error);
    }
  }

  private async getUser(interaction: ButtonInteraction) {
    return await User.get(interaction.user.id);
  }

  private async getCharacter(user: User) {
    return (await user.getPendingCharacters(1))?.[0];
  }

  private async getOrCreateUser(interaction: ButtonInteraction) {
    return (await User.get(interaction.user.id)) || (await User.create(interaction.user.id));
  }

  private createCharacterEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ptBr.createCharacter.title)
      .setDescription(ptBr.createCharacter.description)
      .setFooter({text: ptBr.createCharacter.footerText})
      .setImage(imageLinks.submissionEmbedPopupThumbnail)
      .setColor(Colors.DarkVividPink);
  }

  private createCharacterButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(createCharacterEssentialsButtonId)
        .setLabel(ptBr.buttons.essentials)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(createCharacterAppearanceButtonId)
        .setLabel(ptBr.buttons.appearance)
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(createCharacterSendButtonId)
        .setLabel(ptBr.buttons.send)
        .setDisabled(true)
        .setStyle(ButtonStyle.Success),
    );
  }

  private createSubmissionEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ptBr.submission.title)
      .setDescription(ptBr.submission.description)
      .setFooter({text: ptBr.submission.footerText})
      .setThumbnail(imageLinks.submissionEmbedThumbnail)
      .setTimestamp(Date.now())
      .setColor(Colors.DarkVividPink);
  }

  private createSubmissionButtonRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(createCharacterPopupButtonId)
        .setLabel(ptBr.buttons.createCharacter)
        .setStyle(ButtonStyle.Success),
    );
  }
}
