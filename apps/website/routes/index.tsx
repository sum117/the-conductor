import {CheckCircle, Lightbulb} from "lucide-react";
import {useLoaderData} from "react-router-dom";
import ptBr from "translations";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import type {loader as rootLoader} from "./root";
export default function Index() {
  const user = useLoaderData() as Awaited<ReturnType<ReturnType<typeof rootLoader>>>;

  return (
    <div className="rounded-lg bg-red-200 bg-[url(https://i.imgur.com/CObehuI.jpg)] bg-cover bg-no-repeat p-2">
      <Card className="card sm:mx-auto sm:max-w-lg ">
        <CardHeader>
          <CardTitle>{ptBr.welcomeCard.title}</CardTitle>
          <CardDescription className="card__description sm:flex sm:flex-col sm:gap-y-2 sm:py-2">
            <p>{ptBr.welcomeCard.description}</p>
            <p className="mt-2 inline-flex items-center justify-center sm:w-full">
              <Lightbulb className="h-4 w-4 peer-hover:fill-yellow-200" />
              {ptBr.welcomeCard.tip}
            </p>
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
          {user ? (
            <p>{ptBr.welcomeCard.loginHelp}</p>
          ) : (
            <p className="inline-flex w-full items-center justify-center gap-x-2 stroke-green-600 text-green-600">
              <CheckCircle className="h-4 w-4" />
              {ptBr.welcomeCard.loggedIn}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
