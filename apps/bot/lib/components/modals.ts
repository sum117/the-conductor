import {Channel, Character, Faction, Instrument, ProfilePreferences, Race} from "@prisma/client";
import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import ptBr from "translations";
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

export const entityCreatorRaceModalId = "entityCreatorRaceModal";
export const entityCreatorRaceFields: Omit<Race, "id"> = {
  name: "name",
  description: "description",
  imageUrl: "imageUrl",
};

export const entityCreatorRaceModal = () => {
  const nameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.race.name.label)
      .setPlaceholder(ptBr.modals.entityCreator.race.name.placeholder)
      .setCustomId(entityCreatorRaceFields.name)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(128),
  );

  const descriptionField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.race.description.label)
      .setPlaceholder(ptBr.modals.entityCreator.race.description.placeholder)
      .setCustomId(entityCreatorRaceFields.description)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4000),
  );

  const imageUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.race.imageUrl.label)
      .setPlaceholder(ptBr.modals.entityCreator.race.imageUrl.placeholder)
      .setCustomId(entityCreatorRaceFields.imageUrl)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  return new ModalBuilder()
    .setCustomId(entityCreatorRaceModalId)
    .setTitle(ptBr.modals.entityCreator.race.title)
    .addComponents(nameField, descriptionField, imageUrlField);
};

export const entityCreatorFactionModalId = "entityCreatorFactionModal";
export const entityCreatorFactionFields: Omit<Faction, "id"> = {
  name: "name",
  description: "description",
  imageUrl: "imageUrl",
  emoji: "emoji",
};

export const entityCreatorFactionModal = () => {
  const nameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.faction.name.label)
      .setPlaceholder(ptBr.modals.entityCreator.faction.name.placeholder)
      .setCustomId(entityCreatorFactionFields.name)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(128),
  );

  const descriptionField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.faction.description.label)
      .setPlaceholder(ptBr.modals.entityCreator.faction.description.placeholder)
      .setCustomId(entityCreatorFactionFields.description)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4000),
  );

  const imageUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.faction.imageUrl.label)
      .setPlaceholder(ptBr.modals.entityCreator.faction.imageUrl.placeholder)
      .setCustomId(entityCreatorFactionFields.imageUrl)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  const emojiField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.faction.emoji.label)
      .setPlaceholder(ptBr.modals.entityCreator.faction.emoji.placeholder)
      .setCustomId(entityCreatorFactionFields.emoji)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  return new ModalBuilder()
    .setCustomId(entityCreatorFactionModalId)
    .setTitle(ptBr.modals.entityCreator.faction.title)
    .addComponents(nameField, descriptionField, imageUrlField, emojiField);
};

export const entityCreatorInstrumentModalId = "entityCreatorInstrumentModal";
export const entityCreatorInstrumentFields: Omit<Instrument, "id" | "isBeginner" | "messageId"> & {isBeginner: "isBeginner"} = {
  name: "name",
  description: "description",
  imageUrl: "imageUrl",
  isBeginner: "isBeginner",
};

export const entityCreatorInstrumentModal = () => {
  const nameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.instrument.name.label)
      .setPlaceholder(ptBr.modals.entityCreator.instrument.name.placeholder)
      .setCustomId(entityCreatorInstrumentFields.name)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(128),
  );

  const descriptionField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.instrument.description.label)
      .setPlaceholder(ptBr.modals.entityCreator.instrument.description.placeholder)
      .setCustomId(entityCreatorInstrumentFields.description)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2048),
  );

  const imageUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.instrument.imageUrl.label)
      .setPlaceholder(ptBr.modals.entityCreator.instrument.imageUrl.placeholder)
      .setCustomId(entityCreatorInstrumentFields.imageUrl)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  const isBeginnerField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.entityCreator.instrument.isBeginner.label)
      .setPlaceholder(ptBr.modals.entityCreator.instrument.isBeginner.placeholder)
      .setCustomId(entityCreatorInstrumentFields.isBeginner)
      .setMinLength(3)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(3),
  );

  return new ModalBuilder()
    .setCustomId(entityCreatorInstrumentModalId)
    .setTitle(ptBr.modals.entityCreator.instrument.title)
    .addComponents(nameField, descriptionField, imageUrlField, isBeginnerField);
};

type ChannelFields = Pick<Channel, "name" | "description" | "imageUrl">;
export const rpChannelEditorModalId = "rpChannelEditorModal";
export const rpChannelEditorFields = {
  description: "description",
  imageUrl: "imageUrl",
  name: "name",
} satisfies Omit<Channel, "id" | "placeholderMessageId" | "lastTimeActive">;

export const rpChannelEditorModal = (currentValues: ChannelFields) => {
  const nameField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.rpChannelEditor.name.label)
      .setPlaceholder(ptBr.modals.rpChannelEditor.name.placeholder)
      .setCustomId(rpChannelEditorFields.name)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(128),
  );
  if (currentValues.name) {
    nameField.components[0].setValue(currentValues.name);
  }

  const descriptionField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.rpChannelEditor.description.label)
      .setPlaceholder(ptBr.modals.rpChannelEditor.description.placeholder)
      .setCustomId(rpChannelEditorFields.description)
      .setMinLength(1)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2048),
  );
  if (currentValues.description) {
    descriptionField.components[0].setValue(currentValues.description);
  }
  const imageUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.rpChannelEditor.imageUrl.label)
      .setPlaceholder(ptBr.modals.rpChannelEditor.imageUrl.placeholder)
      .setCustomId(rpChannelEditorFields.imageUrl)
      .setMinLength(1)
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );

  if (currentValues.imageUrl) {
    imageUrlField.components[0].setValue(currentValues.imageUrl);
  }

  return new ModalBuilder()
    .setCustomId(rpChannelEditorModalId)
    .setTitle(ptBr.modals.rpChannelEditor.title)
    .addComponents(nameField, descriptionField, imageUrlField);
};

type ColorPreferenceFields = Pick<ProfilePreferences, "xpBarFillColor" | "featuredCharBorderColor" | "repBarColor" | "textColor" | "xpBarBackgroundColor">;
export const colorPreferencesModalId = "colorPreferencesModal";
export const colorPreferencesFields = {
  xpBarFillColor: "xpBarFillColor",
  featuredCharBorderColor: "featuredCharBorderColor",
  repBarColor: "repBarColor",
  textColor: "textColor",
  xpBarBackgroundColor: "xpBarBackgroundColor",
} satisfies ColorPreferenceFields;

export const colorPreferencesModal = (currentValues: ColorPreferenceFields) => {
  const xpBarFillColorField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.colorPreferences.xpBarFillColor.label)
      .setPlaceholder(ptBr.modals.colorPreferences.xpBarFillColor.placeholder)
      .setCustomId(colorPreferencesFields.xpBarFillColor)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7),
  );
  if (currentValues.xpBarFillColor) {
    xpBarFillColorField.components[0].setValue(currentValues.xpBarFillColor);
  }

  const featuredCharBorderColorField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.colorPreferences.featuredCharBorderColor.label)
      .setPlaceholder(ptBr.modals.colorPreferences.featuredCharBorderColor.placeholder)
      .setCustomId(colorPreferencesFields.featuredCharBorderColor)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7),
  );
  if (currentValues.featuredCharBorderColor) {
    featuredCharBorderColorField.components[0].setValue(currentValues.featuredCharBorderColor);
  }

  const repBarColorField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.colorPreferences.repBarColor.label)
      .setPlaceholder(ptBr.modals.colorPreferences.repBarColor.placeholder)
      .setCustomId(colorPreferencesFields.repBarColor)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7),
  );
  if (currentValues.repBarColor) {
    repBarColorField.components[0].setValue(currentValues.repBarColor);
  }

  const textColorField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.colorPreferences.textColor.label)
      .setPlaceholder(ptBr.modals.colorPreferences.textColor.placeholder)
      .setCustomId(colorPreferencesFields.textColor)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7),
  );
  if (currentValues.textColor) {
    textColorField.components[0].setValue(currentValues.textColor);
  }

  const xpBarBackgroundColorField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.colorPreferences.xpBarBackgroundColor.label)
      .setPlaceholder(ptBr.modals.colorPreferences.xpBarBackgroundColor.placeholder)
      .setCustomId(colorPreferencesFields.xpBarBackgroundColor)
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7),
  );

  if (currentValues.xpBarBackgroundColor) {
    xpBarBackgroundColorField.components[0].setValue(currentValues.xpBarBackgroundColor);
  }

  return new ModalBuilder()
    .setCustomId(colorPreferencesModalId)
    .setTitle(ptBr.modals.colorPreferences.title)
    .addComponents(xpBarFillColorField, featuredCharBorderColorField, repBarColorField, textColorField, xpBarBackgroundColorField);
};

type ProfileAssets = Pick<ProfilePreferences, "backgroundUrl" | "about">;
export const profileAssetsModalId = "profileAssetsModal";
export const profileAssetsFields = {
  backgroundUrl: "backgroundUrl",
  about: "about",
} satisfies ProfileAssets;

export const profileAssetsModal = (currentValues: ProfileAssets) => {
  const backgroundUrlField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.aboutMe.backgroundUrl.label)
      .setPlaceholder(ptBr.modals.aboutMe.backgroundUrl.placeholder)
      .setCustomId(profileAssetsFields.backgroundUrl)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256),
  );
  if (currentValues.backgroundUrl) {
    backgroundUrlField.components[0].setValue(currentValues.backgroundUrl);
  }

  const aboutField = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setLabel(ptBr.modals.aboutMe.newAboutMe.label)
      .setPlaceholder(ptBr.modals.aboutMe.newAboutMe.placeholder)
      .setCustomId(profileAssetsFields.about)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500),
  );
  if (currentValues.about) {
    aboutField.components[0].setValue(currentValues.about);
  }

  return new ModalBuilder().setCustomId(profileAssetsModalId).setTitle(ptBr.modals.aboutMe.title).addComponents(backgroundUrlField, aboutField);
};
