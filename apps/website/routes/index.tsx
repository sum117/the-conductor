import {buttonVariants} from "@/components/ui/button";
import {NAVBAR_DATA} from "@/data/constants";
import useNavbarBounds from "@/hooks/useNavbarBounds";
import {CheckCircle, Lightbulb} from "lucide-react";
import {Fragment} from "react";
import {Link, useRouteLoaderData} from "react-router-dom";
import ptBr from "translations";
import {getSafeKeys} from "utilities";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
export default function Index() {
  const user = useRouteLoaderData("root");
  const {containerRef} = useNavbarBounds();
  return (
    <div ref={containerRef}>
      <div className="grid h-full sm:place-items-center">
        <Card className="card sm:mx-auto sm:max-w-lg">
          <CardHeader>
            <CardTitle>{ptBr.welcomeCard.title}</CardTitle>
            <CardDescription className="card__description mt-2 inline-flex items-center justify-center py-2  sm:w-full sm:gap-y-2">
              <Lightbulb className="h-4 w-4 peer-hover:fill-yellow-200" />
              {ptBr.welcomeCard.tip}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <a
              href="https://discord.gg/3yvjS5HyzR"
              target="_blank"
              className="card__link h-64 w-64 bg-[url(https://i.imgur.com/3SKqyaS.png)] bg-contain bg-center bg-no-repeat hover:bg-[url(https://i.imgur.com/ZeUi0mh.png)]"
            />
          </CardContent>
          <CardFooter>
            {!user ? (
              <p>{ptBr.welcomeCard.loginHelp}</p>
            ) : (
              <div className="mx-auto flex flex-col justify-center gap-y-2">
                <p className="mb-2 inline-flex w-full items-center justify-center gap-x-2 stroke-green-600 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {ptBr.welcomeCard.loggedIn}
                </p>
                {getSafeKeys(NAVBAR_DATA).map((key) => {
                  if (key === "home") return null;
                  const {name, path, children} = NAVBAR_DATA[key];
                  if (children) {
                    return (
                      <Fragment>
                        <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">{name}</h2>
                        <div className="grid grid-cols-2 gap-x-2">
                          <Link to={path} className={buttonVariants({variant: "secondary"})}>
                            {ptBr.routes.home}
                          </Link>
                          {getSafeKeys(children).map((key) => {
                            const {name, path} = children[key];
                            return (
                              <Link key={name} to={path} className={buttonVariants({variant: "secondary"})}>
                                {name}
                              </Link>
                            );
                          })}
                        </div>
                      </Fragment>
                    );
                  }
                  return (
                    <Link key={key} to={path} className={buttonVariants({variant: "secondary"})}>
                      {name}
                    </Link>
                  );
                })}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
