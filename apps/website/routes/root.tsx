import {NAVBAR_DATA, NavbarProps} from "@/data/constants";
import {User} from "@prisma/client";
import {ChevronDown, ChevronsUpDown, LogIn, LogOut, Menu, Moon, Music4, Sun} from "lucide-react";
import React from "react";
import {useQuery, type QueryClient} from "react-query";
import {NavLink, Outlet, Form as RRDForm, useLoaderData, useSubmit} from "react-router-dom";
import ptBr from "translations";
import {getSafeKeys} from "utilities";
import LazyImage from "../components/lazy-image";
import {Button, buttonVariants} from "../components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../components/ui/collapsible";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "../components/ui/hover-card";
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

const getNavLinkClass = ({isActive, isPending}: {isActive: boolean; isPending: boolean}) => {
  if (isActive) return buttonVariants({variant: "link", className: "underline"});
  if (isPending) return buttonVariants({variant: "link", className: "pointer-events-none opacity-50"});
  return buttonVariants({variant: "link"});
};

export default function Root() {
  const {colorTheme, toggleTheme} = useDarkMode();
  const submit = useSubmit();

  const initialData = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const {data: user} = useQuery({...userQuery(), initialData: initialData?.user});
  return (
    <React.Fragment>
      <nav id="navbar" className="border-border bg-background flex items-center justify-between border-b px-4 py-2">
        <Sheet modal={false}>
          <ul>
            <li>
              <NavLink to="/" className="inline-flex items-center gap-x-2">
                <Music4 className="h-8 w-8" />
                <strong className="text-xl">{ptBr.website.title}</strong>
              </NavLink>
            </li>
          </ul>
          <ul className="grid grid-flow-col gap-x-2">
            {getSafeKeys(NAVBAR_DATA).map((key) => {
              if (key === "home") return null;
              const {name, protected: isProtected, path, children} = NAVBAR_DATA[key];
              if (isProtected && !user) return null;
              if (!children) {
                return (
                  <li key={key} className="max-sm:hidden">
                    <NavLink to={path} className={getNavLinkClass}>
                      {name}
                    </NavLink>
                  </li>
                );
              }
              return (
                <DesktopNavItem key={key} path={path} name={name}>
                  {getSafeKeys(children).map((childKey) => {
                    const {name: childName, path: childPath} = children[childKey];
                    return (
                      <NavLink to={childPath} className={getNavLinkClass} key={key}>
                        {childName}
                      </NavLink>
                    );
                  })}
                </DesktopNavItem>
              );
            })}

            <li>
              <SheetTrigger className={buttonVariants({variant: "ghost", size: "icon", className: "sm:hidden"})}>
                <Menu className="h-4 w-4" />
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
            <ul className="mt-2 flex flex-col gap-y-2">{renderMobileNavItems(NAVBAR_DATA, user)}</ul>
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

function renderMobileNavItems(data: Record<string, NavbarProps>, user?: User, level = 0) {
  return getSafeKeys(data).map((key) => {
    if (key === "home") return null;
    const {name, protected: isProtected, children, path} = data[key];
    if (isProtected && !user) return null;
    const style = level > 0 ? {paddingLeft: `${level * 1.5}rem`} : undefined;
    if (children) {
      return (
        <MobileNavItem key={key} path={path} name={name} style={style}>
          <ul className="flex flex-col gap-y-2">{renderMobileNavItems(children, user, level + 1)}</ul>
        </MobileNavItem>
      );
    }

    return <MobileNavItem key={key} path={path} name={name} style={style} />;
  });
}

function MobileNavItem({path, name, children, style}: {path: string; name: string; children?: React.ReactNode; style?: React.CSSProperties}) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(true);

  if (children) {
    return (
      <li style={style}>
        <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
          <div className="flex justify-between">
            <NavLink to={path} className={getNavLinkClass}>
              {name}
            </NavLink>
            <CollapsibleTrigger className={buttonVariants({variant: "ghost", size: "sm", className: "w-9 p-0"})}>
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  return (
    <li style={style}>
      <NavLink to={path} className={getNavLinkClass}>
        {name}
      </NavLink>
    </li>
  );
}

function DesktopNavItem({name, children, path}: {name: string; path: string; children?: React.ReactNode}) {
  const [isHoverCardOpen, setIsHoverCardOpen] = React.useState(false);
  return (
    <li className="max-sm:hidden">
      <HoverCard openDelay={0} onOpenChange={setIsHoverCardOpen} open={isHoverCardOpen}>
        <HoverCardTrigger className={buttonVariants({variant: "ghost", className: "inline-flex items-center gap-x-2"})}>
          {name} <ChevronDown className={cn("h-4 w-4 transition-[transform]", isHoverCardOpen && "rotate-180 transform")} />
        </HoverCardTrigger>
        <HoverCardContent className="max-w-max">
          <NavLink to={path} className={buttonVariants({variant: "link"})} key={name}>
            {ptBr.routes.home}
          </NavLink>
          {children}
        </HoverCardContent>
      </HoverCard>
    </li>
  );
}
