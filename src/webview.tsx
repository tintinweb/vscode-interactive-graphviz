import React from "react";
import { createRoot } from "react-dom/client";
import WebViewBundle from "./webview/WebViewBundle";

const container = document.getElementById("root") as HTMLElement;

// Create a root.
const root = createRoot(container);
root.render(
  <WebViewBundle />,
);
