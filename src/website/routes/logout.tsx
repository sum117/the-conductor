import {redirect} from "react-router-dom";
import {removeCookie} from "../lib/utils";

export async function action() {
  localStorage.removeItem("user");
  removeCookie("token", "/", new URL(Bun.env.WEBSITE_BASE_URL).hostname);
  return redirect("/website/");
}