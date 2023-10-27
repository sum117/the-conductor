import {characterQuery} from "@/lib/queries";
import {QueryClient} from "react-query";
import {ActionFunctionArgs} from "react-router-dom";

export const action =
  (queryClient: QueryClient) =>
  async ({params, request}: ActionFunctionArgs) => {
    let formData = await request.formData();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/characters/${params.characterId}/edit`, {method: "PATCH", body: formData});
    queryClient.invalidateQueries(characterQuery(Number(params.characterId)).queryKey);
    if (response.ok) {
      const link = await response.text();
      return link;
    }
    return null;
  };
