import {Character as CharacterPrisma} from "@prisma/client";
import {cn} from "../lib/utils";

export function Character({character, handleCharacterClick, className}: {character: CharacterPrisma; handleCharacterClick: () => void; className?: string}) {
  if (!character.id) return null;
  if (!character.imageUrl) return null;
  if (!character.personality) return null;
  if (!character.name) return null;

  return (
    <article className={cn(className)}>
      <figure className="group relative max-w-fit">
        <figcaption className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent to-black opacity-100 transition-opacity duration-300 group-hover:opacity-0">
          <span className="z-10 py-4 text-xl capitalize text-neutral-50">{character.name}</span>
        </figcaption>
        <button className="h-full w-full" onClick={handleCharacterClick}>
          <img src={character.imageUrl} alt={character.name} className="h-96 w-56 object-cover" />
        </button>
      </figure>
    </article>
  );
}
