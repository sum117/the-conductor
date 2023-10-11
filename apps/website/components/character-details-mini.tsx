import {Character} from "@prisma/client";
import {Trash} from "lucide-react";
import {Form} from "react-router-dom";
import ptBr from "translations";
import {hasKey} from "utilities";
import {INFO_BOX_FIELDS} from "../data/constants";
import {Button} from "./ui/button";

export function CharacterDetailsMini({character}: {character: Character}) {
  return (
    <section className="border-border rounded-sm border max-sm:mx-auto">
      {character?.imageUrl && character?.name && (
        <div className="relative">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="aspect-square h-64 w-full rounded-md object-cover object-top shadow-sm shadow-neutral-100 max-sm:w-full"
          />
          <Form
            action="delete"
            method="POST"
            onSubmit={(event) => {
              if (!confirm(ptBr.form.delete.confirmation)) {
                event.preventDefault();
              }
            }}
          >
            <Button type="submit" className="absolute right-0 top-0 m-2" size="icon" variant="destructive">
              <Trash className="h-4 w-4" />
            </Button>
          </Form>
        </div>
      )}
      <ul className="py- 4 grid  px-8">
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
