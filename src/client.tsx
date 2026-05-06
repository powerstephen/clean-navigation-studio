import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();
const rootEl = document.getElementById("root");

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

startTransition(() => {
  if (rootEl) {
    // Static build (generate-index.mjs ships an empty <div id="root">)
    createRoot(rootEl).render(app);
  } else {
    // Dev / SSR: TanStack rendered the full document; hydrate it.
    hydrateRoot(document, app);
  }
});
