import {LoaderFunctionArgs, redirect} from "react-router-dom";

export async function loader({request}: LoaderFunctionArgs) {
  const code = new URL(request.url).searchParams.get("code");
  console.log(code);
  if (!code) throw redirect("/website/");

  const response = await fetch(`${Bun.env.API_BASE_URL}/discord/callback?code=${code}`);
  if (!response.ok) throw new Response("", {status: 401, statusText: "Unauthorized"});

  const data = await response.json();
  localStorage.setItem("user", JSON.stringify(data));
  throw redirect("/website/");
}
