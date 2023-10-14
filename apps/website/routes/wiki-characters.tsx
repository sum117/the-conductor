import LazyImage from "@/components/lazy-image";
import {Button} from "@/components/ui/button";
import useNavbarBounds from "@/hooks/useNavbarBounds";
import {WikiCharacterLink, WikiCharactersResponse, wikiCharactersQuery} from "@/lib/queries";
import {cn} from "@/lib/utils";
import {ArrowBigLeftDash, ArrowBigRightDash} from "lucide-react";
import {useEffect} from "react";
import {QueryClient, useQuery} from "react-query";
import {Form, Link, LoaderFunctionArgs, useLoaderData, useNavigation, useSubmit} from "react-router-dom";

export const loader =
  (queryClient: QueryClient) =>
  async ({request}: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const isMobile = window.matchMedia("not all and (min-width: 640px)").matches;
    const pageSize = isMobile ? 6 : 8;
    const query = wikiCharactersQuery<WikiCharacterLink[]>({page, pageSize});

    const charactersData = queryClient.getQueryData<WikiCharactersResponse<WikiCharacterLink[]>>(query.queryKey) ?? (await queryClient.fetchQuery(query));

    return {charactersData, page, pageSize};
  };

export default function WikiCharacters() {
  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: charactersData} = useQuery({
    ...wikiCharactersQuery<WikiCharacterLink[]>({page: initialData.page, pageSize: initialData.pageSize}),
    initialData: initialData.charactersData,
  });
  const {containerRef} = useNavbarBounds();
  const navigation = useNavigation();
  const submit = useSubmit();
  const pageInput = document.getElementById("page") as HTMLInputElement;

  useEffect(() => {
    if (!pageInput) return;
    pageInput.value = initialData?.page.toString() ?? "1";
  }, [initialData?.page, pageInput]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, page: number) => {
    event.preventDefault();
    pageInput.value = page.toString();
    submit(event.currentTarget.form, {
      replace: true,
    });
  };

  return (
    <div ref={containerRef} className="mx-auto flex max-w-max flex-col items-start p-6">
      <header>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Personagens</h1>
      </header>
      <div className="mt-4 flex flex-1 flex-col justify-between py-2">
        <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", navigation.state === "loading" ? "animate-pulse" : "")}>
          {charactersData?.characters
            ?.filter((character) => Boolean(character.imageUrl) && Boolean(character.name))
            .map((character) => (
              <Link key={character.id} to={character.link} className="flex flex-col items-center gap-x-4 transition-all hover:scale-110">
                <LazyImage
                  rounded
                  src={character.imageUrl!}
                  placeholderSrc="website-bg-placeholder.jpg"
                  alt={character.name!}
                  cover
                  className="aspect-square h-40 w-40"
                />
                <span>{character.name}</span>
              </Link>
            ))}
        </div>
        <Form id="page-form" role="search" action="/wiki/characters" className="grid grid-cols-2 gap-x-4">
          <input type="hidden" name="page" value={initialData.page} id="page" />
          <Button
            variant="ghost"
            size="lg"
            disabled={initialData.page <= 1 || navigation.state === "loading"}
            onClick={(event) => handlePageChange(event, initialData.page - 1)}
          >
            <ArrowBigLeftDash className="h-8 w-8" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={initialData.page >= (charactersData?.totalPages ?? 1) || navigation.state === "loading"}
            onClick={(event) => handlePageChange(event, initialData.page + 1)}
          >
            <ArrowBigRightDash className="h-8 w-8" />
            <span className="sr-only">Next page</span>
          </Button>
        </Form>
      </div>
    </div>
  );
}
