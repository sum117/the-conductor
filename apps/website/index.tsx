/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import {createRoot} from "react-dom/client";
import {QueryClient, QueryClientProvider} from "react-query";
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";
import "./globals.css";
import {action as deleteAction} from "./routes/delete";
import {loader as loginLoader} from "./routes/login";
import {action as logoutAction} from "./routes/logout";
import Root, {loader as rootLoader} from "./routes/root";
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/website" element={<Root />} loader={rootLoader(queryClient)}>
      <Route path="login" loader={loginLoader} />
      <Route path="logout" action={logoutAction} />
      <Route path="delete" action={deleteAction(queryClient)} />
    </Route>,
  ),
);
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
