import {Character as TCharacter} from "@prisma/client";
import React from "react";
import {QueryClient, useQuery} from "react-query";
import {LoaderFunctionArgs, useLoaderData, useNavigate} from "react-router-dom";
import ptBr from "translations";
import {getSafeKeys, hasKey} from "utilities";
import {CharacterDetailsMini} from "../components/character-details-mini";
import {InfoSheet} from "../components/info-sheet";
import {INFO_BOX_FIELDS} from "../data/constants";
import {characterQuery} from "../lib/queries";

export const loader =
  (queryClient: QueryClient) =>
  async ({params}: LoaderFunctionArgs) => {
    const characterId = params?.characterId;
    if (!characterId) return null;

    const query = characterQuery(Number(characterId));
    const character = queryClient.getQueryData<TCharacter>(query.queryKey) ?? (await queryClient.fetchQuery(query));
    return {character, characterId};
  };

export default function Character() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: character} = useQuery({...characterQuery(Number(initialData?.characterId)), initialData: initialData?.character});
  const navigate = useNavigate();

  const characterFullName = `${character?.name} ${character?.surname}`;

  return (
    <InfoSheet title={characterFullName} open={Boolean(character?.id)} onOpenChange={() => navigate(-1)}>
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
  );
}
