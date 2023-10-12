import {QueryClient, useQuery} from "react-query";
import {Link, useLoaderData} from "react-router-dom";
import LazyImage from "../components/lazy-image";
import {buttonVariants} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Announcement, WidgetData, WikiCharacterLink, WikiCharactersResponse, announcementsQuery, widgetQuery, wikiCharactersQuery} from "../lib/queries";

export const loader = (queryClient: QueryClient) => async () => {
  const queryWidget = widgetQuery();
  const queryCaracters = wikiCharactersQuery<WikiCharacterLink[]>();
  const queryAnnouncement = announcementsQuery();

  const widgetData = queryClient.getQueryData<WidgetData>(queryWidget.queryKey) ?? (await queryClient.fetchQuery(queryWidget));
  const characters =
    queryClient.getQueryData<WikiCharactersResponse<WikiCharacterLink[]>>(queryCaracters.queryKey) ?? (await queryClient.fetchQuery(queryCaracters));
  const announcements = queryClient.getQueryData<Announcement[]>(queryAnnouncement.queryKey) ?? (await queryClient.fetchQuery(queryAnnouncement));

  return {widgetData, characters, announcements};
};

export default function Wiki() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  console.log(initialData);
  const {data: widgetData} = useQuery({...widgetQuery(), initialData: initialData.widgetData});
  const {data: charactersData} = useQuery({...wikiCharactersQuery<WikiCharacterLink[]>(), initialData: initialData.characters});
  const {data: announcements} = useQuery({...announcementsQuery(), initialData: initialData.announcements});

  return (
    <div className="mx-auto flex max-w-6xl gap-x-4 py-4 max-sm:flex-col">
      <div className="flex max-w-3xl flex-col gap-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Bem vindo à Wiki do Maestro Obscuro!</CardTitle>
            <CardDescription>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio magni velit, id dolorem quos repellat nesciunt, sunt totam, quaerat omnis unde
              libero rerum veritatis sequi explicabo repellendus architecto! Doloremque amet est incidunt laboriosam illo magnam dolorum aliquid sunt, similique
              iure maxime, quibusdam laborum odit quae saepe quasi. Delectus totam at ratione natus, laudantium expedita repellendus sint eum incidunt, deserunt
              ipsum quidem itaque saepe, temporibus error soluta iure adipisci. Odio ipsam corporis cupiditate a vel, reprehenderit inventore hic culpa quod
              nostrum quia. Natus, animi in eius, reprehenderit mollitia minus nostrum, nemo dolorem harum cupiditate quasi nam voluptates. Repudiandae expedita
              natus atque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyImage rounded src="/website-bg.jpg" placeholderSrc="/website-bg-placeholder.jpg" alt="Wiki Background" />
          </CardContent>
          <CardFooter>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam quasi eligendi aut temporibus nisi molestias dolorem officiis asperiores
              sapiente? Iste suscipit libero sunt unde repellendus quia eaque dolor labore fuga consectetur qui a in ab reprehenderit deleniti veniam impedit
              fugiat, voluptatem ad. Accusantium modi eligendi labore quasi eius? Quam animi natus provident quae qui? Natus possimus odit voluptatem facilis.
              Mollitia dolor delectus praesentium esse sed pariatur amet culpa omnis repudiandae modi voluptate ex veniam, adipisci, beatae quidem dolorem
              maiores earum et tempora, asperiores inventore cum repellat suscipit eligendi. Quis nemo recusandae minus qui ipsa quam dolores ipsam molestiae
              quaerat exercitationem.
            </p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personagem em Destaque</CardTitle>
            <CardDescription>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Esse, necessitatibus?</CardDescription>
          </CardHeader>
          <CardContent>
            <LazyImage
              src="https://pic.re/image"
              rounded
              className="mb-4 aspect-video h-96 w-full"
              cover
              placeholderSrc="https://pic.re/image"
              alt="Wiki Background"
            />
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam quasi eligendi aut temporibus nisi molestias dolorem officiis asperiores
              sapiente? Iste suscipit libero sunt unde repellendus quia eaque dolor labore fuga consectetur qui a in ab reprehenderit deleniti veniam impedit
              fugiat, voluptatem ad. Accusantium modi eligendi labore quasi eius? Quam animi natus provident quae qui? Natus possimus odit voluptatem facilis.
              Mollitia dolor delectus praesentium esse sed pariatur amet culpa omnis repudiandae modi voluptate ex veniam, adipisci, beatae quidem dolorem
              maiores earum et tempora, asperiores inventore cum repellat suscipit eligendi. Quis nemo recusandae minus qui ipsa quam dolores ipsam molestiae
              quaerat exercitationem.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Anúncios</CardTitle>
            <CardDescription>Os Anúncios recentes do servidor.</CardDescription>
          </CardHeader>
          <CardContent className="flex max-h-96 flex-col gap-y-2 overflow-auto">
            {announcements?.map((announcement) => (
              <div className="border-border flex flex-col gap-y-2 border p-2" key={announcement.content}>
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
                  return <p>{paragraph}</p>;
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
            <CardTitle>Novos Personagens</CardTitle>
            <CardDescription>Personagens criados recentemente no servidor.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            {charactersData?.characters?.map((character) => (
              <Link
                to={`characters/${character.link}`}
                key={character.id}
                className="bg-primary-foreground border-border hover:bg-secondary group inline-flex w-full max-w-xs flex-1 items-center gap-x-4 rounded-sm border px-1 py-2 transition-colors"
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
            <CardDescription>A atividade do nosso servidor do Discord!</CardDescription>
          </CardHeader>
          <CardContent>
            {widgetData?.members?.map((member) => (
              <div className="flex items-center gap-x-2" key={member.id}>
                <LazyImage width={32} height={32} rounded className="h-4 w-4" src={member.avatar_url + "?size=32"} alt={member.username} key={member.id} />
                <p>{member.username}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-x-2">
            <small className="text-muted-foreground">Não há motivo para esperar mais...</small>
            <a target="_blank" className={buttonVariants()} href={widgetData?.instant_invite}>
              Conectar
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
