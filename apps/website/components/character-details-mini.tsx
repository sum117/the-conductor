import {Character} from "@prisma/client";
import {Pencil, Trash} from "lucide-react";
import {Form, useFetcher} from "react-router-dom";
import ptBr from "translations";
import {hasKey} from "utilities";
import {INFO_BOX_FIELDS} from "../data/constants";
import {Button} from "./ui/button";

export function CharacterDetailsMini({character}: {character: Character}) {
  const fetcher = useFetcher();

  return (
    <section className="border-border rounded-sm border max-sm:mx-auto">
      {character?.imageUrl && character?.name && (
        <div className="relative">
          {fetcher.state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md">
              <div className="border-primary h-16 w-16 animate-spin rounded-full border-t-2" />
            </div>
          )}
          <img
            src={character.imageUrl}
            alt={character.name}
            className="aspect-square h-64 w-full rounded-md object-cover object-top shadow-sm shadow-neutral-100 max-sm:w-full"
          />
          <div className="absolute bottom-0 right-0 flex gap-x-2 p-2">
            <Form
              action="delete"
              method="POST"
              onSubmit={(event) => {
                if (!confirm(ptBr.form.delete.confirmation)) {
                  event.preventDefault();
                }
              }}
            >
              <Button type="submit" size="icon" variant="destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </Form>
            <fetcher.Form action="edit" method="PATCH" encType="multipart/form-data">
              <Button type="button" size="icon" variant="default" className="relative">
                <Pencil className="h-4 w-4" />
                <label htmlFor="image" className="absolute inset-0 cursor-pointer">
                  <span className="sr-only">Edit Image</span>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(event) => {
                      fetcher.submit(event.currentTarget.form, {action: "edit", method: "PATCH"});
                    }}
                  />
                </label>
              </Button>
            </fetcher.Form>
          </div>
        </div>
      )}
      <ul className="grid p-4">
        {INFO_BOX_FIELDS.map((key) => {
          if (!hasKey(ptBr.character, key)) return null;
          return (
            <li key={key} className="inline-flex flex-wrap justify-between gap-x-2 max-sm:gap-x-4">
              <span className="font-thin capitalize tracking-tight">{ptBr.character[key]}</span>
              {character?.[key]}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
