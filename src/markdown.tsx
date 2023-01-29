import "@vscode/codicons/dist/codicon.css";

import React from "react";
import { createRoot, Root } from "react-dom/client";
import View from "./shared/View";

let roots : Root[] = [];

function contentLoaded() {
  roots.forEach((root) => {
    try {
      // root.unmount();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      console.log(root);
    }
  });
  roots = [];

  const graphvizElements = document.getElementsByClassName("graphviz");

  for (let index = 0; index < graphvizElements.length; index += 1) {
    const element = graphvizElements.item(index);

    // eslint-disable-next-line no-continue
    if (!element) continue;

    const r = element.insertAdjacentElement("afterend", document.createElement("div"));
    // eslint-disable-next-line no-continue
    if (!r) continue;

    const root = createRoot(r);

    roots.push(root);

    const source = element.textContent;

    element.textContent = null;

    // eslint-disable-next-line no-continue
    if (!source) continue;

    root.render(<View
      source={source}
      disableToolbar
    />);
  }

  // use to debug rendered code.
  // document.body.appendChild(document.createTextNode(document.body.innerHTML));
}

window.addEventListener("load", () => {
  contentLoaded();
}, false);

window.addEventListener("vscode.markdown.updateContent", () => {
  contentLoaded();
});
