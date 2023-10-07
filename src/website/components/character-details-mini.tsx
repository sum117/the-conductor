import {Character} from "@prisma/client";
import React from "react";
import {ptBr} from "../../translations/ptBr";
import {INFO_BOX_FIELDS} from "../data/constants";
import {hasKey} from "../lib/utils";

export function CharacterDetailsMini({character}: {character: Character}) {
  return (
    <section className="rounded-sm border border-border max-sm:mx-auto">
      {character?.imageUrl && character?.name && (
        <img
          src={character.imageUrl}
          alt={character.name}
          className="h-64 w-full rounded-md object-cover object-top shadow-sm shadow-neutral-100 max-sm:w-full"
        />
      )}
      <ul className="grid px-8 py-4">
        {INFO_BOX_FIELDS.map((key) => {
          if (!hasKey(ptBr.character, key)) return null;
          return (
            <li key={key} className="inline-flex flex-wrap justify-between max-sm:gap-x-4">
              <span className="font-thin capitalize tracking-tight">{ptBr.character[key]}</span>
              {character?.[key]}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
