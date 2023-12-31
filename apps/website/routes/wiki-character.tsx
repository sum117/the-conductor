import LazyImage from "@/components/lazy-image";
import {WIKI_CHARACTER_DETAILS_FIELDS, WIKI_CHARACTER_FIELDS} from "@/data/constants";
import {ArrowBigDownDash, ArrowBigUpDash, ArrowLeft, Dot, List} from "lucide-react";
import React, {useState} from "react";
import {QueryClient, useQuery} from "react-query";
import {Link, LoaderFunctionArgs, useLoaderData, useNavigate} from "react-router-dom";
import ptBr from "translations";
import {getSafeEntries, hasKey} from "utilities";
import {Button, buttonVariants} from "../components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../components/ui/collapsible";
import {WikiCharacter as TWikiCharacter, wikiCharacterQuery} from "../lib/queries";

export const loader =
  (queryClient: QueryClient) =>
  async ({params}: LoaderFunctionArgs) => {
    const {slug} = params;
    if (!slug) throw new Response(null, {status: 404});

    const query = wikiCharacterQuery(slug);
    const character = queryClient.getQueryData<TWikiCharacter>(query.queryKey) ?? (await queryClient.fetchQuery(query));
    return {character, slug};
  };

export default function WikiCharacter() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: character} = useQuery({...wikiCharacterQuery(initialData.slug), initialData: initialData.character});
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="bg-background relative flex py-4 max-sm:flex-col-reverse max-sm:gap-y-4 sm:mx-auto sm:max-w-4xl ">
      <article className="sm:w-prose px-8 sm:flex-1">
        {history.length > 2 && (
          <Button
            variant="ghost"
            className="absolute left-0 top-5"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="h-8 w-8" />
            <span className="sr-only">{ptBr.website.back}</span>
          </Button>
        )}
        <header>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight max-sm:text-center sm:pl-8 lg:text-5xl">{character?.name}</h1>
        </header>
        <Collapsible open={open} onOpenChange={setOpen} className="bg-primary-foreground my-8 mb-8 max-w-fit max-sm:mx-auto max-sm:hidden">
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
      <article className="bg-primary-foreground flex h-min max-w-xs flex-col gap-y-2 max-sm:max-w-full max-sm:py-2 sm:mx-4">
        <span className="text-center text-2xl font-semibold tracking-tight">{ptBr.characterDetails.playerMade}</span>
        {character?.imageUrl && character?.name && <LazyImage src={character.imageUrl} alt={character?.name} cover className="h-72 w-72 max-sm:w-full" />}
        <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight transition-colors first:mt-0">{character?.name}</h2>
        {getSafeEntries(WIKI_CHARACTER_DETAILS_FIELDS).map(([label, entries]) => (
          <React.Fragment key={label}>
            <h3 className="bg-muted-foreground scroll-m-20 text-center text-2xl font-semibold tracking-tight">{ptBr.characterDetails[label]}</h3>
            {entries.map((subField) => {
              if (!character) return null;
              if (subField === "marriedTo" && character[subField]?.length)
                return (
                  <div key={subField} className="flex justify-between px-2">
                    <span className="font-semibold">{ptBr.character[subField]}</span>
                    <span className="flex flex-col gap-y-4">
                      {character?.[subField].map((character) => (
                        <Link key={character.name} to={`/wiki/characters/${character.slug}`} className="underline">
                          {character.name}
                        </Link>
                      ))}
                    </span>
                  </div>
                );
              if (!hasKey(character, subField) || subField === "marriedTo") return null;
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
