import {zodResolver} from "@hookform/resolvers/zod";
import {Faction, Race, type Character} from "@prisma/client";
import {LogIn, LogOut, Music4, Plus} from "lucide-react";
import React, {useEffect, useMemo, useState} from "react";
import {Button, buttonVariants} from "./components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./components/ui/dialog";
import {Input} from "./components/ui/input";
import * as SelectPrimitive from "./components/ui/select";
import {AuthContext} from "./context/Auth";
import useAuth from "./hooks/useAuth";
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  Bun.env.WEBSITE_BASE_URL,
)}&response_type=code&scope=identify`;

import {useForm} from "react-hook-form";
import {z} from "zod";
import {cn, getSafeKeys} from "../react/lib/utils";
import {ptBr} from "../translations/ptBr";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "./components/ui/form";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "./components/ui/sheet";
import {Textarea} from "./components/ui/textarea";

const CharacterSchema = z.object({
  name: z.string({required_error: "O nome é obrigatório."}),
  surname: z.string({required_error: "O sobrenome é obrigatório."}),
  personality: z.string({required_error: "A personalidade é obrigatória."}),
  appearance: z.string({required_error: "A aparência é obrigatória."}),
  backstory: z.string({required_error: "A história é obrigatória."}),
  imageUrl: z.string({required_error: "A URL da Imagem é obrigatória"}).url({message: "O URL da imagem não é válido."}),
  age: z.string({required_error: "A idade é obrigatória."}),
  height: z.string({required_error: "A altura é obrigatória."}),
  gender: z.string({required_error: "O gênero é obrigatório."}),
  weight: z.string({required_error: "O peso é obrigatório."}),
  race: z.string({required_error: "A raça é obrigatória."}),
  faction: z.string({required_error: "A facção é obrigatória."}),
});

const infoBoxFields = ["gender", "weight", "height", "age", "userId"] as const;
function hasKey<T>(obj: T, key: string | number | symbol): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export default function App() {
  const {user, logout, setUser} = useAuth();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  const handleCharacterClick = (id: number) => {
    setSelectedCharacterId(id);
  };

  const character = useMemo(() => user?.characters?.find((character) => character.id === selectedCharacterId), [user, selectedCharacterId]);
  const characterFullName = useMemo(() => `${character?.name} ${character?.surname}`, [character]);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Maestro Obscuro</title>
        <link href="/public/output.css" rel="stylesheet" />
        <meta name="description" content="Maestro Obscuro Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="dark">
        <AuthContext.Provider value={{user, setUser}}>
          <nav className="mb-4 flex items-center justify-between border-b border-border px-4 py-2">
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
                <Button variant="destructive" size="icon" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </ul>
          </nav>
          <main className="container">
            {user && (
              <section className="flex justify-center gap-x-2">
                {user?.characters?.map((character) => (
                  <Character character={character} key={character.id} handleCharacterClick={() => handleCharacterClick(character.id)} />
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
                {character?.imageUrl && character?.name && (
                  <section className="rounded-sm border border-border max-sm:mx-auto">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="h-64 w-full rounded-md object-cover object-top shadow-sm shadow-neutral-100 max-sm:w-full"
                    />
                    <ul className="grid px-8 py-4">
                      {infoBoxFields.map((key) => {
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
                )}
                {character &&
                  getSafeKeys(character).map((key) => {
                    if (key === "imageUrl" || key === "name" || key === "surname" || infoBoxFields.includes(key)) return null;
                    if (!hasKey(ptBr.character, key)) return null;

                    return (
                      <section key={key}>
                        <h2 className="text-xl font-bold capitalize">{ptBr.character[key]}</h2>
                        <p>{character?.[key]}</p>
                      </section>
                    );
                  })}
              </article>
            </InfoSheet>
          </main>
        </AuthContext.Provider>
      </body>
    </html>
  );
}

function Character({character, handleCharacterClick}: {character: Character; handleCharacterClick: () => void}) {
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

function CharacterForm({submit}: {submit: React.ReactNode}) {
  const selectFields = ["race", "faction"];
  const textAreaFields = ["personality", "appearance", "backstory"];
  const [raceOptions, setRaceOptions] = useState<Race[] | null>([]);
  const [factionOptions, setFactionOptions] = useState<Faction[] | null>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    async function fetchSelectOptions() {
      try {
        const racesResponse = await fetch(`api/races`, {signal});
        const factionsResponse = await fetch(`api/factions`, {signal});
        if (signal.aborted) return;

        const racesJson = racesResponse.ok ? await racesResponse.json() : null;
        const factionsJson = factionsResponse.ok ? await factionsResponse.json() : null;
        setRaceOptions(racesJson as Race[]);
        setFactionOptions(factionsJson as Faction[]);
      } catch (error) {
        if (error instanceof Error) setError(error.message);
        else setError(ptBr.errors.somethingWentWrong);
      }
    }
    fetchSelectOptions();
    return () => {
      abortController.abort();
    };
  }, []);

  const form = useForm<z.infer<typeof CharacterSchema>>({resolver: zodResolver(CharacterSchema)});

  function onSubmit(values: z.infer<typeof CharacterSchema>) {
    console.log(values);
  }

  if (error) return <p>{error}</p>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2 px-4 max-sm:grid-cols-1">
        {getSafeKeys(CharacterSchema.keyof().Enum).map((key) => {
          if (selectFields.includes(key)) {
            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{ptBr.character[key]}</FormLabel>
                    <FormControl>
                      <SelectPrimitive.Select onValueChange={field.onChange}>
                        <SelectPrimitive.SelectTrigger>
                          <SelectPrimitive.SelectValue placeholder={ptBr.character[key]} />
                        </SelectPrimitive.SelectTrigger>
                        <SelectPrimitive.SelectContent>
                          {(key === "faction" ? factionOptions : raceOptions)?.map((option) => (
                            <SelectPrimitive.SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectPrimitive.SelectItem>
                          ))}
                        </SelectPrimitive.SelectContent>
                      </SelectPrimitive.Select>
                    </FormControl>
                    <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          } else if (textAreaFields.includes(key)) {
            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({field}) => (
                  <FormItem className="col-span-full">
                    <FormLabel>{ptBr.character[key]}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={ptBr.form.character[key].placeholder} className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          return (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({field}) => (
                <FormItem className={cn(key === "imageUrl" ? "col-span-full" : "")}>
                  <FormLabel>{ptBr.character[key]}</FormLabel>
                  <FormControl>
                    <Input placeholder={ptBr.form.character[key].placeholder} {...field} />
                  </FormControl>
                  <FormDescription>{ptBr.form.character[key].description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        {submit}
      </form>
    </Form>
  );
}

function CharacterCreatePlaceholder() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="grid h-96 w-56 place-content-center border border-border bg-none">
          <Plus />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-scroll p-4 max-sm:max-h-screen sm:max-w-[553px]">
        <DialogHeader>
          <DialogTitle className="">{ptBr.form.createChar}</DialogTitle>
          <DialogDescription>{ptBr.form.createCharDescription}</DialogDescription>
        </DialogHeader>
        <CharacterForm
          submit={
            <DialogFooter className="col-span-full mt-2">
              <Button type="submit">{ptBr.form.sendChar}</Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
}

type InfoSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

function InfoSheet({onOpenChange, open, children, title, description}: InfoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[100dvh] overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="text-center text-3xl">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
