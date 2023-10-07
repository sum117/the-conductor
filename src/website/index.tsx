/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import {createRoot} from "react-dom/client";
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";
import {loader as loginLoader} from "./routes/login";
import Root, {loader as rootLoader} from "./routes/root";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/website" element={<Root />} loader={rootLoader}>
      <Route path="login" loader={loginLoader} />
    </Route>,
  ),
);
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
