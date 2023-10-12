import {LogIn, LogOut, Menu, Moon, Music4, Sun} from "lucide-react";
import React from "react";
import {useQuery, type QueryClient} from "react-query";
import {NavLink, Outlet, Form as RRDForm, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import LazyImage from "../components/lazy-image";
import {Button, buttonVariants} from "../components/ui/button";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "../components/ui/sheet";
import {Toaster} from "../components/ui/toaster";
import {DISCORD_OAUTH_URL} from "../data/constants";
import useDarkMode from "../hooks/useDarkMode";
import {userQuery} from "../lib/queries";
import {cn} from "../lib/utils";

export const loader = (queryClient: QueryClient) => async () => {
  try {
    const query = userQuery();

    const user = await queryClient.fetchQuery(query);
    if (!user) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/discord/logout`);
      return null;
    }
    return {
      user,
    };
  } catch {
    return null;
  }
};

export default function Root() {
  const {colorTheme, toggleTheme} = useDarkMode();
  const submit = useSubmit();

  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: user} = useQuery({...userQuery(), initialData: initialData?.user});

  return (
    <React.Fragment>
      <nav className="border-border bg-background flex items-center justify-between border-b px-4 py-2">
        <Sheet>
          <ul>
            <li className="inline-flex items-center gap-x-2">
              <Music4 className="h-8 w-8" />
              <strong className="text-xl">{ptBr.website.title}</strong>
            </li>
          </ul>
          <ul className="grid grid-flow-col gap-x-2">
            <li>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </li>
            <li>
              {!user ? (
                <a role="button" href={DISCORD_OAUTH_URL} className={buttonVariants({variant: "outline"})}>
                  <LogIn className="mr-2 h-4 w-4" /> {ptBr.login}
                </a>
              ) : (
                <React.Fragment>
                  <RRDForm method="post" action="logout">
                    <Button variant="destructive" size="icon" type="button" onClick={(event) => submit(event.currentTarget.form)}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </RRDForm>
                </React.Fragment>
              )}
            </li>
            <li>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {colorTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </li>
          </ul>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{ptBr.website.title}</SheetTitle>
              <SheetDescription>{ptBr.website.navigation}</SheetDescription>
            </SheetHeader>
            <ul className="mt-2 flex flex-col gap-y-2">
              <li>
                <NavLink
                  to="/"
                  className={({isActive, isPending}) =>
                    cn(
                      "w-full",
                      isActive ? buttonVariants({variant: "default", size: "lg"}) : buttonVariants({variant: "outline", size: "lg"}),
                      isPending ? "opacity-50" : "",
                    )
                  }
                >
                  {ptBr.routes.home}
                </NavLink>
              </li>
              {user && (
                <li>
                  <NavLink
                    to="/characters"
                    className={({isActive, isPending}) =>
                      cn(
                        "w-full",
                        isActive ? buttonVariants({variant: "default", size: "lg"}) : buttonVariants({variant: "outline", size: "lg"}),
                        isPending ? "opacity-50" : "",
                      )
                    }
                  >
                    {ptBr.routes.characters}
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/wiki"
                  className={({isActive, isPending}) =>
                    cn(
                      "w-full",
                      isActive ? buttonVariants({variant: "default", size: "lg"}) : buttonVariants({variant: "outline", size: "lg"}),
                      isPending ? "opacity-50" : "",
                    )
                  }
                >
                  {ptBr.routes.wiki}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/wiki/characters"
                  className={({isActive, isPending}) =>
                    cn(
                      "w-full",
                      isActive ? buttonVariants({variant: "default", size: "lg"}) : buttonVariants({variant: "outline", size: "lg"}),
                      isPending ? "opacity-50" : "",
                    )
                  }
                >
                  {ptBr.routes.wikiCharacters}
                </NavLink>
              </li>
            </ul>
          </SheetContent>
        </Sheet>
      </nav>
      <main className="relative">
        <LazyImage
          placeholderSrc="/website-bg-placeholder.jpg"
          src="/website-bg.jpg"
          alt="Website background"
          cover
          className={cn("fixed inset-0 -z-10 opacity-30")}
        />
        <Outlet />
        <Toaster />
      </main>
    </React.Fragment>
  );
}
