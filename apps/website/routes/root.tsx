import {Prisma} from "@prisma/client";
import useEmblaCarousel from "embla-carousel-react";
import {Dot, Lightbulb, LogIn, LogOut, Moon, MoveLeft, MoveRight, Music4, Sun} from "lucide-react";
import React, {useEffect, useMemo, useState} from "react";
import {LoaderFunctionArgs, Form as RRDForm, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import {getSafeKeys, hasKey} from "utilities";
import {Character as CharacterCard} from "../components/character";
import {CharacterCreatePlaceholder} from "../components/character-create-placeholder";
import {CharacterDetailsMini} from "../components/character-details-mini";
import {InfoSheet} from "../components/info-sheet";
import {Button, buttonVariants} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Toaster} from "../components/ui/toaster";
import {DISCORD_OAUTH_URL, INFO_BOX_FIELDS} from "../data/constants";
import useCarouselDotButtons from "../hooks/useCarouselDotButtons";
import useCarouselPrevNextButtons from "../hooks/useCarouselPrevNextButtons";
import useDarkMode from "../hooks/useDarkMode";
import {cn, removeCookie} from "../lib/utils";

export type UserPrisma = Prisma.UserGetPayload<{include: {characters: true}}>;

export async function loader({request}: LoaderFunctionArgs) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/discord/check`);
    if (!response.ok) return null;

    const localStorageData = localStorage.getItem("user");
    if (!localStorageData) {
      removeCookie("token", "/", new URL(import.meta.env.VITE_WEBSITE_BASE_URL).hostname);
      return null;
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    const user = JSON.parse(localStorageData) as UserPrisma;
    user.characters = user.characters.filter((character) => character.name?.toLowerCase().includes(q?.toLowerCase() ?? ""));
    return {
      user,
      q,
    };
  } catch {
    return null;
  }
}

export default function Root() {
  const data = useLoaderData() as {user: UserPrisma; q: string} | null;
  const user = data?.user;
  const q = data?.q;

  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const handleCharacterClick = (id: number) => {
    setSelectedCharacterId(id);
  };

  useEffect(() => {
    const searchInput = document.getElementById("q") as HTMLInputElement;
    if (!searchInput) return;
    searchInput.value = q ?? "";
  }, [q]);

  const [carouselRef, carouselApi] = useEmblaCarousel();

  const {selectedIndex, scrollSnaps, onDotButtonClick} = useCarouselDotButtons(carouselApi);

  const {prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick} = useCarouselPrevNextButtons(carouselApi);

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
            <React.Fragment>
              <RRDForm id="search-form" role="search">
                <Input
                  id="q"
                  name="q"
                  placeholder={ptBr.form.searchChar}
                  type="search"
                  defaultValue={q}
                  onChange={(event) => {
                    const isFirstSearch = q == null;
                    submit(event.currentTarget.form, {
                      replace: !isFirstSearch,
                    });
                  }}
                />
              </RRDForm>
              <RRDForm method="post" action="logout" onSubmit={(event) => event?.preventDefault()}>
                <Button variant="destructive" size="icon" type="submit" onClick={(event) => submit(event.currentTarget.form)}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </RRDForm>
            </React.Fragment>
          )}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {colorTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </ul>
      </nav>
      <main className="container">
        {user ? (
          <section className="embla">
            <h1 className="text-primary mb-2 text-2xl">Seus Personagens</h1>
            <div className="embla__viewport" ref={carouselRef}>
              <div className="embla__container">
                {user?.characters?.map((character) => (
                  <CharacterCard
                    className="embla__slide"
                    character={character}
                    key={character.id}
                    handleCharacterClick={() => handleCharacterClick(character.id)}
                  />
                ))}
                <CharacterCreatePlaceholder />
              </div>
              <Button className="embla__prev" variant="outline" size="icon" onClick={onPrevButtonClick} disabled={prevBtnDisabled}>
                <MoveLeft className="h-4 w-4" />
              </Button>
              <Button className="embla__next" variant="outline" size="icon" onClick={onNextButtonClick} disabled={nextBtnDisabled}>
                <MoveRight className="h-4 w-4" />
              </Button>
              <div className="inline-flex w-full justify-center">
                {scrollSnaps.map((_, index) => (
                  <Dot
                    key={index}
                    onClick={() => onDotButtonClick(index)}
                    className={cn("stroke-primary h-12 w-12 opacity-50", index === selectedIndex && "opacity-100")}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-lg bg-red-200 bg-[url(https://i.imgur.com/CObehuI.jpg)] bg-cover bg-no-repeat p-2">
            <Card className="card sm:mx-auto sm:max-w-lg ">
              <CardHeader>
                <CardTitle>{ptBr.welcomeCard.title}</CardTitle>
                <CardDescription className="card__description sm:flex sm:flex-col sm:gap-y-2 sm:py-2">
                  <p>{ptBr.welcomeCard.description}</p>
                  <p className="mt-2 inline-flex items-center justify-center sm:w-full">
                    <Lightbulb className="h-4 w-4 peer-hover:fill-yellow-200" />
                    {ptBr.welcomeCard.tip}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <a
                  href="https://discord.gg/3yvjS5HyzR"
                  target="_blank"
                  className="card__link h-64 w-64 bg-[url(https://i.imgur.com/3SKqyaS.png)] bg-contain bg-center bg-no-repeat hover:bg-[url(https://i.imgur.com/ZeUi0mh.png)]"
                />
              </CardContent>
              <CardFooter>
                <p>{ptBr.welcomeCard.loginHelp}</p>
              </CardFooter>
            </Card>
          </div>
        )}
        <InfoSheet
          title={characterFullName}
          open={Boolean(selectedCharacterId)}
          onOpenChange={(open) => setSelectedCharacterId(open ? selectedCharacterId : null)}
        >
          <article className="flex items-start gap-x-4 max-sm:flex-col max-sm:gap-x-0 max-sm:gap-y-4 max-sm:text-start">
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
        <Toaster />
      </main>
    </React.Fragment>
  );
}
