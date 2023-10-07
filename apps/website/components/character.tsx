import {Character as CharacterPrisma} from "@prisma/client";
import React from "react";

export function Character({character, handleCharacterClick}: {character: CharacterPrisma; handleCharacterClick: () => void}) {
  if (!character.id) return null;
  if (!character.imageUrl) return null;
  if (!character.personality) return null;
  if (!character.name) return null;

  return (
    <article>
      <figure className="group relative max-w-fit">
        <figcaption className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent to-black opacity-100 transition-opacity duration-300 group-hover:opacity-0">
          <span className="py-4 text-xl capitalize">{character.name}</span>
        </figcaption>
        <button className="h-full w-full" onClick={handleCharacterClick}>
          <img src={character.imageUrl} alt={character.name} className="h-96 w-56 object-cover" />
        </button>
      </figure>
    </article>
  );
}
