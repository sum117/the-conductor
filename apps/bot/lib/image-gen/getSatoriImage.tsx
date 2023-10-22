import React from "react";
import satori, {SatoriOptions} from "satori";
import sharp from "sharp";
import {UserCard, UserCardProps} from "./user-card";

export async function getSatoriImage(props: UserCardProps, options: SatoriOptions) {
  const svg = await satori(
    <UserCard
      userLevel={props.userLevel}
      levelEmoji={props.levelEmoji}
      topFiveCharacters={props.topFiveCharacters.slice(0, 5)}
      progressBarWidth={props.progressBarWidth}
      counters={props.counters}
      mainCharacterWithUser={props.mainCharacterWithUser}
      profilePreferences={props.profilePreferences}
      user={props.user}
    />,
    options,
  );
  const png = await sharp(Buffer.from(svg), {
    unlimited: true,
  })
    .png()
    .toBuffer();
  return png;
}
