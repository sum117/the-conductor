import {Prisma} from "@prisma/client";
import {LogIn, LogOut, Moon, Music4, Sun} from "lucide-react";
import React, {useMemo, useState} from "react";
import {Form as RRDForm, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import {getSafeKeys, hasKey} from "utilities";
import {Character as CharacterCard} from "../components/character";
import {CharacterCreatePlaceholder} from "../components/character-create-placeholder";
import {CharacterDetailsMini} from "../components/character-details-mini";
import {InfoSheet} from "../components/info-sheet";
import {Button, buttonVariants} from "../components/ui/button";
import {DISCORD_OAUTH_URL, INFO_BOX_FIELDS} from "../data/constants";
import useDarkMode from "../hooks/useDarkMode";
import {removeCookie} from "../lib/utils";
export type UserPrisma = Prisma.UserGetPayload<{include: {characters: true}}>;

export async function loader() {
  try {
    const response = await fetch(`${import.meta.env.API_BASE_URL}/discord/check`);
    if (!response.ok) return null;

    const localStorageData = localStorage.getItem("user");
    if (!localStorageData) {
      removeCookie("token", "/", new URL(import.meta.env.WEBSITE_BASE_URL).hostname);
      return null;
    }

    return JSON.parse(localStorageData) as UserPrisma;
  } catch {
    return null;
  }
}

export default function Root() {
  const user = useLoaderData() as UserPrisma | null;
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const handleCharacterClick = (id: number) => {
    setSelectedCharacterId(id);
  };

  const {colorTheme, toggleTheme} = useDarkMode();

  const character = useMemo(() => user?.characters?.find((character) => character.id === selectedCharacterId), [user, selectedCharacterId]);
  const characterFullName = useMemo(() => `${character?.name} ${character?.surname}`, [character]);
  const submit = useSubmit();

  return (
    <React.Fragment>
      <nav className="border-border mb-4 flex items-center justify-between border-b px-4 py-2">
        <ul>
          <li className="inline-flex items-center gap-x-2">
            <Music4 className="h-8 w-8" />
            <strong className="text-xl">Maestro Obscuro</strong>
          </li>
        </ul>
        <ul className="grid grid-flow-col gap-x-2">
          {!user ? (
            <a role="button" href={DISCORD_OAUTH_URL} className={buttonVariants({variant: "outline"})}>
              <LogIn className="mr-2 h-4 w-4" /> {ptBr.login}
            </a>
          ) : (
            <RRDForm method="post" action="logout" onSubmit={(event) => event?.preventDefault()}>
              <Button variant="destructive" size="icon" type="submit" onClick={(event) => submit(event.currentTarget.form)}>
                <LogOut className="h-4 w-4" />
              </Button>
            </RRDForm>
          )}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {colorTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </ul>
      </nav>
      <main className="container">
        {user && (
          <section className="flex justify-center gap-x-2">
            {user?.characters?.map((character) => (
              <CharacterCard character={character} key={character.id} handleCharacterClick={() => handleCharacterClick(character.id)} />
            ))}
            <CharacterCreatePlaceholder />
          </section>
        )}
        <InfoSheet
          title={characterFullName}
          open={Boolean(selectedCharacterId)}
          onOpenChange={(open) => setSelectedCharacterId(open ? selectedCharacterId : null)}
        >
          <article className="flex flex-row-reverse items-start gap-x-4 max-sm:flex-col max-sm:gap-x-0 max-sm:gap-y-4 max-sm:text-start">
            {character && (
              <React.Fragment>
                <CharacterDetailsMini character={character} />
                {getSafeKeys(character).map((key) => {
                  if (!hasKey(ptBr.character, key) || INFO_BOX_FIELDS.includes(key) || key === "imageUrl" || key === "surname" || key === "name") return null;
                  return (
                    <section key={key}>
                      <h2 className="text-xl font-bold capitalize">{ptBr.character?.[key]}</h2>
                      <p>{character[key]}</p>
                    </section>
                  );
                })}
              </React.Fragment>
            )}
          </article>
        </InfoSheet>
      </main>
    </React.Fragment>
  );
}
