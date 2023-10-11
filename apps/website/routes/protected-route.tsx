import {QueryClient} from "react-query";
import {Navigate, Outlet, useLoaderData} from "react-router-dom";

export const loader = (queryClient: QueryClient) => async () => {
  try {
    const user = await queryClient.getQueryData("user");
    if (!user) return null;

    return {
      user,
    };
  } catch {
    return null;
  }
};

export default function ProtectedRoute() {
  const data = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  if (!data?.user) return <Navigate to="/" replace />;

  return <Outlet />;
}
