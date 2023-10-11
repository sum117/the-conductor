import {LoaderFunctionArgs, redirect} from "react-router-dom";

export async function loader({request}: LoaderFunctionArgs) {
  try {
    const code = new URL(request.url).searchParams.get("code");
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/discord/callback?code=${code}`);
    throw null;
  } catch {
    throw redirect("/");
  }
}
