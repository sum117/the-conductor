import {QueryClient} from "react-query";
import {redirect} from "react-router-dom";

export const action = (queryClient: QueryClient) => async () => {
  queryClient.setQueryData("user", null);
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/discord/logout`);
  await queryClient.invalidateQueries("user");
  throw redirect("/");
};
