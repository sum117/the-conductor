/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import {createRoot} from "react-dom/client";
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom";
import Root from "./routes/root";

const router = createBrowserRouter(createRoutesFromElements(<Route path="/website" element={<Root />} />));
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
