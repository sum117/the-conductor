import {User} from "@prisma/client";
import {LogIn, LogOut, Menu, Moon, Music4, Sun} from "lucide-react";
import React from "react";
import {useQuery, type QueryClient} from "react-query";
import {NavLink, Outlet, Form as RRDForm, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import {Button, buttonVariants} from "../components/ui/button";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "../components/ui/sheet";
import {Toaster} from "../components/ui/toaster";
import {DISCORD_OAUTH_URL} from "../data/constants";
import useDarkMode from "../hooks/useDarkMode";
import {cn, removeCookie} from "../lib/utils";

const userQuery = () => ({
  queryKey: "user",
  queryFn: async () => {
    const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/discord/check`);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const user = await response.json();
    return user as User;
  },
});

export const loader = (queryClient: QueryClient) => async () => {
  try {
    const query = userQuery();

    const user = await queryClient.fetchQuery(query);
    if (!user) {
      removeCookie("token", "/", new URL(import.meta.env.VITE_WEBSITE_BASE_URL).hostname);
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
      <nav className="border-border mb-4 flex items-center justify-between border-b px-4 py-2">
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
                    <Button variant="destructive" size="icon" type="submit" onClick={(event) => submit(event.currentTarget.form)}>
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
            </ul>
          </SheetContent>
        </Sheet>
      </nav>
      <main className="container">
        <Outlet />
        <Toaster />
      </main>
    </React.Fragment>
  );
}
