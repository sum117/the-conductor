import {QueryClient, useQuery} from "react-query";
import {Link, useLoaderData} from "react-router-dom";
import LazyImage from "../components/lazy-image";
import {buttonVariants} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import ptBr from "translations";
import {
  Announcement,
  WidgetData,
  WikiCharacterLink,
  WikiCharactersResponse,
  announcementsQuery,
  featuredCharacterQuery,
  widgetQuery,
  wikiCharactersQuery,
} from "../lib/queries";
import {Character} from "@prisma/client";

export const loader = (queryClient: QueryClient) => async () => {
  const queryWidget = widgetQuery();
  const queryCaracters = wikiCharactersQuery<WikiCharacterLink[]>();
  const queryAnnouncement = announcementsQuery();
  const queryFeaturedCharacter = featuredCharacterQuery();
  const widgetData = queryClient.getQueryData<WidgetData>(queryWidget.queryKey) ?? (await queryClient.fetchQuery(queryWidget));
  const characters =
    queryClient.getQueryData<WikiCharactersResponse<WikiCharacterLink[]>>(queryCaracters.queryKey) ?? (await queryClient.fetchQuery(queryCaracters));
  const announcements = queryClient.getQueryData<Announcement[]>(queryAnnouncement.queryKey) ?? (await queryClient.fetchQuery(queryAnnouncement));
  const featuredCharacter = queryClient.getQueryData<Character>(queryFeaturedCharacter.queryKey) ?? (await queryClient.fetchQuery(queryFeaturedCharacter));
  return {widgetData, characters, announcements, featuredCharacter};
};

export default function Wiki() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: widgetData} = useQuery({...widgetQuery(), initialData: initialData.widgetData});
  const {data: charactersData} = useQuery({...wikiCharactersQuery<WikiCharacterLink[]>(), initialData: initialData.characters});
  const {data: announcements} = useQuery({...announcementsQuery(), initialData: initialData.announcements});
  const {data: featuredCharacter} = useQuery({...featuredCharacterQuery(), initialData: initialData.featuredCharacter});

  return (
    <div className="mx-auto flex max-w-6xl gap-x-4 py-4 max-sm:flex-col max-sm:gap-y-4">
      <div className="flex max-w-3xl flex-col gap-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{ptBr.wiki.welcome}</CardTitle>
            {ptBr.wiki.description.split("\n").map((paragraph) => {
              return (
                <CardDescription key={paragraph} className="[&:not(:last-of-type)]:mb-2">
                  {paragraph}
                </CardDescription>
              );
            })}
          </CardHeader>
          <CardContent>
            <LazyImage rounded src="/website-bg.jpg" placeholderSrc="/website-bg-placeholder.jpg" alt="Wiki Background" />
          </CardContent>
          <CardFooter className="max-sm:flex max-sm:flex-col">
            {ptBr.wiki.footer.split("\n").map((paragraph) => {
              return (
                <p key={paragraph} className="[&:not(:last-of-type)]:mb-2">
                  {paragraph}
                </p>
              );
            })}
            <a
              href="https://discord.gg/3yvjS5HyzR"
              target="_blank"
              className={buttonVariants({size: "sm", className: "text-center max-sm:mt-2 max-sm:w-full"})}
            >
              {ptBr.wiki.button}
            </a>
          </CardFooter>
        </Card>
        <Link to={{pathname: `characters/${featuredCharacter?.slug}`}}>
          <Card>
            <CardHeader>
              <CardTitle>{ptBr.wiki.featuredCharacter}</CardTitle>
              {featuredCharacter?.appearance?.split("\n").map((paragraph) => {
                return (
                  <CardDescription className="[&:not(:last-of-type)]:mb-2" key={paragraph}>
                    {paragraph}
                  </CardDescription>
                );
              })}
            </CardHeader>
            <CardContent>
              <LazyImage src={featuredCharacter?.imageUrl!} rounded className="mb-4 aspect-video h-96 w-full" cover alt="Wiki Background" />
              {featuredCharacter?.personality?.split("\n").map((paragraph) => {
                return (
                  <p className="[&:not(:last-of-type)]:mb-2" key={paragraph}>
                    {paragraph}
                  </p>
                );
              })}
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{ptBr.wiki.announcements.label}</CardTitle>
            <CardDescription>{ptBr.wiki.announcements.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex max-h-96 flex-col gap-y-2 overflow-auto">
            {announcements?.map((announcement) => (
              <div className="border-border flex flex-col gap-y-2 break-words border p-2" key={announcement.content}>
                {announcement.content.split("\n").map((paragraph) => {
                  const linkRegex = /\[(?<text>.*?)\]\((?<url>https?:\/\/[^)]+)\)/g;
                  const matches = [...paragraph.matchAll(linkRegex)];
                  if (matches.length > 0) {
                    return (
                      <p key={paragraph}>
                        {matches.map((match) => {
                          const {text, url} = match.groups!;
                          return (
                            <a key={text} href={url} target="_blank" className={buttonVariants({variant: "link"})}>
                              {text}
                            </a>
                          );
                        })}
                      </p>
                    );
                  }
                  return paragraph;
                })}
                {announcement.attachments?.map((attachment) => <LazyImage key={attachment} src={attachment} alt={attachment} cover rounded />)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{ptBr.wiki.newChars.label}</CardTitle>
            <CardDescription>{ptBr.wiki.newChars.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            {charactersData?.characters?.map((character) => (
              <Link
                to={`characters/${character.link}`}
                key={character.id}
                className="bg-primary-foreground border-border hover:bg-secondary group inline-flex w-full flex-1 items-center gap-x-4 rounded-sm border px-1 py-2 transition-colors sm:max-w-xs"
              >
                <LazyImage rounded src={character.imageUrl} alt={character.name} cover className="aspect-square h-16 w-16 shadow-sm shadow-black" />
                <p className="text-lg group-hover:underline">{character.name}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex justify-between">
              <p>Discord</p>
              <p>
                <strong>{widgetData?.presence_count}</strong> Online
              </p>
            </CardTitle>
            <CardDescription>{ptBr.wiki.discordNotice}</CardDescription>
          </CardHeader>
          <CardContent>
            {widgetData?.members?.map((member) => (
              <div className="flex items-center gap-x-2" key={member.id}>
                <LazyImage width={32} height={32} rounded className="h-4 w-4" src={member.avatar_url + "?size=32"} alt={member.username} key={member.id} />
                <p>{member.username}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between gap-x-2">
            <small className="text-muted-foreground">{ptBr.wiki.call}</small>
            <a target="_blank" className={buttonVariants()} href={widgetData?.instant_invite}>
              Conectar
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
