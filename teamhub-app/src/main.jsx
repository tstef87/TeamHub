import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { backfillSearchTokens } from "./firestore/Users";
if (import.meta.env.DEV) window.backfillSearchTokens = backfillSearchTokens;


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);