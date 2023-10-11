import {XCircle} from "lucide-react";
import {useLocation, useRouteError} from "react-router-dom";
import ptBr from "translations";
import {z} from "zod";
import {cn} from "./lib/utils";
export default function ErrorPage() {
  const location = useLocation();

  const error = useRouteError();
  console.error(error);

  const errorSchema = z.object({message: z.string()}).or(z.object({statusText: z.string()}));
  const errorParsedResult = errorSchema.safeParse(error);
  const errorMessage = errorParsedResult.success
    ? "statusText" in errorParsedResult.data
      ? errorParsedResult.data.statusText
      : errorParsedResult.data.message
    : "...";

  return (
    <div className={cn("bg-primary text-primary-foreground flex flex-col items-center justify-center gap-y-2", location.pathname === "/" ? "h-screen" : "")}>
      <h1 className="text-3xl">{ptBr.errors.somethingWentWrong}</h1>
      <XCircle className="stroke-primary-foreground h-16 w-16" />
      <p className="text-secondary">{ptBr.errors.somethingWentWrongDescription}</p>
      <p>
        <i className="text-destructive">{errorMessage}</i>
      </p>
    </div>
  );
}
