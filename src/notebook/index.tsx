/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import "@vscode/codicons/dist/codicon.css";

import errorOverlay from "vscode-notebook-error-overlay";
import type { ActivationFunction, OutputItem } from "vscode-notebook-renderer";
import * as React from "react";
import { createRoot } from "react-dom/client";
import Bundle from "./Bundle";

// Fix the public path so that any async import()'s work as expected.
// declare const __webpack_relative_entrypoint_to_root__: string;
// declare const scriptUrl: string;

// __webpack_public_path__ = new URL(scriptUrl.replace(/[^/]+$/, "") +
// __webpack_relative_entrypoint_to_root__).toString();

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate: ActivationFunction = (context) => ({

  renderOutputItem(outputItem: OutputItem, element) {
    errorOverlay.install(element);
    const root = createRoot(element);
    root.render(
      <Bundle outputItem={outputItem} context={context} />,
    );
  },
  disposeOutputItem(/* outputId */) {
    // Do any teardown here. outputId is the cell output being deleted, or
    // undefined if we're clearing all outputs.
  },
});