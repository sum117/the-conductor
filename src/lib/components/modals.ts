import {Character} from "@prisma/client";
import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {ptBr} from "../../translations/ptBr";

export const submissionEssentialsModalId = "submissionEssentialsModal";

type Essentials = Pick<Character, "name" | "surname" | "personality" | "backstory" | "age">;

export const submissionEssentialsModal = (essentials?: Essentials) => {
  const nameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.essentials.name.label)
      .setCustomId("name")
      .setPlaceholder(ptBr.modals.essentials.name.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(128),
  );

  if (essentials?.name) {
    nameField.components[0].setValue(essentials?.name);
  }

  const surnameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.essentials.surname.label)
      .setCustomId("surname")
      .setPlaceholder(ptBr.modals.essentials.surname.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(128),
  );

  if (essentials?.surname) {
    surnameField.components[0].setValue(essentials?.surname);
  }

  const personalityField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.essentials.personality.label)
      .setCustomId("personality")
      .setPlaceholder(ptBr.modals.essentials.personality.placeholder)
      .setMinLength(0)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1024),
  );

  if (essentials?.personality) {
    personalityField.components[0].setValue(essentials?.personality);
  }

  const backstoryField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.essentials.backstory.label)
      .setCustomId("backstory")
      .setPlaceholder(ptBr.modals.essentials.backstory.placeholder)
      .setMinLength(0)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2048),
  );

  if (essentials?.backstory) {
    backstoryField.components[0].setValue(essentials?.backstory);
  }

  const ageField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.essentials.age.label)
      .setCustomId("age")
      .setPlaceholder(ptBr.modals.essentials.age.placeholder)
      .setMinLength(0)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(3),
  );

  if (essentials?.age) {
    ageField.components[0].setValue(essentials?.age.toString());
  }

  return new ModalBuilder()
    .setCustomId(submissionEssentialsModalId)
    .setTitle(ptBr.modals.essentials.title)
    .addComponents(nameField, surnameField, personalityField, backstoryField, ageField);
};

type Appearance = Pick<Character, "appearance" | "height" | "gender" | "weight" | "imageUrl">;
export const submissionAppearanceModalId = "submissionAppearanceModal";

export const submissionAppearanceModal = (appearance?: Appearance) => {
  const appearanceField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.appearance.appearance.label)
      .setCustomId("appearance")
      .setPlaceholder(ptBr.modals.appearance.appearance.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(512),
  );

  if (appearance?.appearance) {
    appearanceField.components[0].setValue(appearance?.appearance);
  }

  const heightField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.appearance.height.label)
      .setCustomId("height")
      .setPlaceholder(ptBr.modals.appearance.height.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(64),
  );

  if (appearance?.height) {
    heightField.components[0].setValue(appearance?.height.toString());
  }

  const genderField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.appearance.gender.label)
      .setCustomId("gender")
      .setPlaceholder(ptBr.modals.appearance.gender.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(64),
  );

  if (appearance?.gender) {
    genderField.components[0].setValue(appearance?.gender);
  }

  const weightField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.appearance.weight.label)
      .setCustomId("weight")
      .setPlaceholder(ptBr.modals.appearance.weight.placeholder)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(64),
  );

  if (appearance?.weight) {
    weightField.components[0].setValue(appearance?.weight.toString());
  }

  const imageUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.appearance.imageUrl.label)
      .setCustomId("imageUrl")
      .setPlaceholder(ptBr.modals.appearance.imageUrl.placeholder)
      .setMinLength(0)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  if (appearance?.imageUrl) {
    imageUrlField.components[0].setValue(appearance?.imageUrl);
  }

  return new ModalBuilder()
    .setCustomId(submissionEssentialsModalId)
    .setTitle(ptBr.modals.appearance.title)
    .addComponents(appearanceField, heightField, genderField, weightField, imageUrlField);
};
