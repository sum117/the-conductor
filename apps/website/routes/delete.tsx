import {QueryClient} from "react-query";
import {ActionFunctionArgs, redirect} from "react-router-dom";

export const action =
  (queryClient: QueryClient) =>
  async ({params}: ActionFunctionArgs) => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/characters/delete/${params.characterId}`, {method: "DELETE"});
    queryClient.invalidateQueries("characters");
    return redirect("/characters");
  };
