import {QueryClient} from "react-query";
import {redirect} from "react-router-dom";
import {removeCookie} from "../lib/utils";

export const action = (queryClient: QueryClient) => () => {
  queryClient.setQueryData("user", null);
  removeCookie("token", "/", new URL(import.meta.env.VITE_WEBSITE_BASE_URL).hostname);
  throw redirect("/");
};
