import useEmblaCarousel from "embla-carousel-react";
import {Dot, MoveLeft, MoveRight} from "lucide-react";
import {useEffect} from "react";
import {QueryClient, useQuery} from "react-query";
import {Form, LoaderFunctionArgs, Outlet, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import {Character as CharacterCard} from "../components/character";
import {CharacterCreatePlaceholder} from "../components/character-create-placeholder";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import useCarouselDotButtons from "../hooks/useCarouselDotButtons";
import useCarouselPrevNextButtons from "../hooks/useCarouselPrevNextButtons";
import {charactersQuery} from "../lib/queries";
import {cn} from "../lib/utils";

export const loader =
  (queryClient: QueryClient) =>
  async ({request}: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const characters = await queryClient.fetchQuery(charactersQuery(q));
    return {characters, q};
  };

export default function Characters() {
  const [carouselRef, carouselApi] = useEmblaCarousel();
  const {selectedIndex, scrollSnaps, onDotButtonClick} = useCarouselDotButtons(carouselApi);
  const {prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick} = useCarouselPrevNextButtons(carouselApi);

  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: characters} = useQuery({...charactersQuery(), initialData: initialData?.characters});
  const submit = useSubmit();

  useEffect(() => {
    const searchInput = document.getElementById("q") as HTMLInputElement;
    if (!searchInput) return;
    searchInput.value = initialData?.q ?? "";
  }, [initialData?.q]);

  return (
    <div className="container py-8">
      <section className="embla">
        <header className="mb-2 flex justify-between">
          <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Seus Personagens</h1>
          <Form id="search-form" role="search">
            <Input
              id="q"
              name="q"
              placeholder={ptBr.form.searchChar}
              type="search"
              defaultValue={initialData?.q ?? ""}
              onChange={(event) => {
                const isFirstSearch = initialData?.q == null;
                submit(event.currentTarget.form, {
                  action: "/characters",
                  replace: !isFirstSearch,
                });
              }}
            />
          </Form>
        </header>
        <div className="embla__viewport" ref={carouselRef}>
          <div className="embla__container">
            {characters?.map((character) => <CharacterCard className="embla__slide" character={character} key={character.id} />)}
            <CharacterCreatePlaceholder />
          </div>
          <Button className="embla__prev max-sm:hidden" variant="outline" size="icon" onClick={onPrevButtonClick} disabled={prevBtnDisabled}>
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button className="embla__next max-sm:hidden" variant="outline" size="icon" onClick={onNextButtonClick} disabled={nextBtnDisabled}>
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
      <Outlet />
    </div>
  );
}
