import LazyImage from "@/components/lazy-image";
import {WIKI_CHARACTER_DETAILS_FIELDS, WIKI_CHARACTER_FIELDS} from "@/data/constants";
import {ArrowBigDownDash, ArrowBigUpDash, ArrowLeft, Dot, List} from "lucide-react";
import React, {useState} from "react";
import {QueryClient, useQuery} from "react-query";
import {LoaderFunctionArgs, useLoaderData, useNavigate} from "react-router-dom";
import ptBr from "translations";
import {getSafeEntries, hasKey} from "utilities";
import {Button, buttonVariants} from "../components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../components/ui/collapsible";
import {WikiCharacter as TWikiCharacter, wikiCharacterQuery} from "../lib/queries";

export const loader =
  (queryClient: QueryClient) =>
  async ({params}: LoaderFunctionArgs) => {
    const {characterName} = params;
    if (!characterName) throw new Response(null, {status: 404});

    const query = wikiCharacterQuery(characterName);
    const character = queryClient.getQueryData<TWikiCharacter>(query.queryKey) ?? (await queryClient.fetchQuery(query));
    return {character, characterName};
  };

export default function WikiCharacter() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: character} = useQuery({...wikiCharacterQuery(initialData.characterName), initialData: initialData.character});
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="bg-background flex py-4 max-sm:flex-col sm:mx-auto sm:max-w-4xl">
      <article className="relative px-8 sm:max-w-prose sm:px-12">
        <Button variant="ghost" className="absolute left-0 top-2 max-sm:top-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-8 w-8" />
          <span className="sr-only">{ptBr.website.back}</span>
        </Button>
        <header>
          <h1 className="scroll-m-20 pl-5 text-4xl font-extrabold tracking-tight max-sm:text-center lg:text-5xl">{character?.name}</h1>
        </header>
        <Collapsible open={open} onOpenChange={setOpen} className="bg-primary-foreground my-8 mb-8 max-w-fit max-sm:mx-auto">
          <CollapsibleTrigger asChild>
            <div className="bg-muted-foreground inline-flex w-full items-center gap-x-4 rounded-tl-sm rounded-tr-sm px-2 py-2">
              <List className="h-4 w-4" />
              <span className="text-lg">{ptBr.website.summary}</span>
              <Button variant="ghost" size="sm">
                {!open ? <ArrowBigDownDash className="h-4 w-4" /> : <ArrowBigUpDash className="h-4 w-4" />}
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col">
              {WIKI_CHARACTER_FIELDS.map((field) => {
                if (!hasKey(character, field)) return null;
                return (
                  <li key={field} className="inline-flex items-center">
                    <Dot className="h-8 w-8" />
                    <a href={`#${field}`} className={buttonVariants({variant: "link"})}>
                      {ptBr.character[field]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
        <section>
          {WIKI_CHARACTER_FIELDS.map((field) => {
            if (!character) return null;
            if (!hasKey(character, field)) return null;
            return (
              <div key={field} id={field} className="py-4">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">{ptBr.character[field]}</h2>
                {character[field]?.split("\n").map((paragraph) => (
                  <p key={paragraph} className="leading-7 [&:not(:first-child)]:mt-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          })}
        </section>
      </article>
      <article className="bg-primary-foreground flex max-h-min max-w-xs flex-col gap-y-2 max-sm:mx-auto">
        <span className="text-center text-2xl font-semibold tracking-tight">{ptBr.characterDetails.playerMade}</span>
        {character?.imageUrl && character?.name && <LazyImage src={character.imageUrl} alt={character?.name} />}
        <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight transition-colors first:mt-0">{character?.name}</h2>
        {getSafeEntries(WIKI_CHARACTER_DETAILS_FIELDS).map(([label, entries]) => (
          <React.Fragment key={label}>
            <h3 className="bg-muted-foreground scroll-m-20 text-center text-2xl font-semibold tracking-tight">{ptBr.characterDetails[label]}</h3>
            {entries.map((subField) => {
              if (!character) return null;
              if (!hasKey(character, subField)) return null;
              return (
                <div key={subField} className="flex justify-between px-2">
                  <span className="font-semibold">{ptBr.character[subField]}</span>
                  {subField !== "faction" && subField !== "race" ? <span>{character[subField]}</span> : <span>{character[subField]?.name}</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </article>
    </div>
  );
}
