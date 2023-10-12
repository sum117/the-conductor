import {XCircle} from "lucide-react";
import {useRouteError} from "react-router-dom";
import ptBr from "translations";
import {z} from "zod";
import {cn} from "./lib/utils";
export default function ErrorPage() {
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
    <div className={cn("text-primary flex flex-col items-center justify-center gap-y-2")}>
      <h1 className="text-3xl">{ptBr.errors.somethingWentWrong}</h1>
      <XCircle className="stroke-primary h-16 w-16" />
      <p className="text-secondary-foreground">{ptBr.errors.somethingWentWrongDescription}</p>
      <p>
        <i className="text-destructive">{errorMessage}</i>
      </p>
    </div>
  );
}
