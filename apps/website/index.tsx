/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import {createRoot} from "react-dom/client";
import {QueryClient, QueryClientProvider} from "react-query";
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";
import ErrorPage from "./error-page";
import "./globals.css";
import Index from "./routes";
import Character, {loader as characterLoader} from "./routes/character";
import Characters, {loader as charactersLoader} from "./routes/characters";
import {action as deleteAction} from "./routes/delete";
import {loader as loginLoader} from "./routes/login";
import {action as logoutAction} from "./routes/logout";
import ProtectedRoute, {loader as protectedRouteLoader} from "./routes/protected-route";
import Root, {loader as rootLoader} from "./routes/root";
import Wiki, {loader as wikiLoader} from "./routes/wiki";
import WikiCharacter, {loader as wikiCharacterLoader} from "./routes/wiki-character";
import WikiCharacters, {loader as wikiCharactersLoader} from "./routes/wiki-characters";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route id="root" path="/" element={<Root />} loader={rootLoader(queryClient)} errorElement={<ErrorPage />}>
      <Route errorElement={<ErrorPage />}>
        <Route index element={<Index />} />
        <Route path="login" loader={loginLoader} />
        <Route path="logout" action={logoutAction(queryClient)} />

        <Route element={<ProtectedRoute />} loader={protectedRouteLoader(queryClient)}>
          <Route path="characters" element={<Characters />} loader={charactersLoader(queryClient)}>
            <Route path=":characterId" element={<Character />} loader={characterLoader(queryClient)} />
            <Route path=":characterId/delete" action={deleteAction(queryClient)} />
          </Route>
        </Route>
        <Route path="wiki">
          <Route index element={<Wiki />} loader={wikiLoader(queryClient)} />
          <Route path="characters" loader={wikiCharactersLoader(queryClient)} element={<WikiCharacters />} />
          <Route path="characters/:characterName" element={<WikiCharacter />} loader={wikiCharacterLoader(queryClient)} />
        </Route>
      </Route>
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
