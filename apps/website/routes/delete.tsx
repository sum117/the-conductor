import {QueryClient} from "react-query";
import {ActionFunctionArgs, redirect} from "react-router-dom";

export const action =
  (queryClient: QueryClient) =>
  async ({request}: ActionFunctionArgs) => {
    const formData = await request.formData();
    const characterId = formData.get("id");
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/characters/delete/${characterId}`, {method: "DELETE"});
    queryClient.invalidateQueries("user");
    return redirect("/website/");
  };
