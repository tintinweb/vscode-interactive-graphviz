/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import errorOverlay from "vscode-notebook-error-overlay";
import type { ActivationFunction } from "vscode-notebook-renderer";
import { render } from "./render";

// Fix the public path so that any async import()'s work as expected.
// eslint-disable-next-line no-underscore-dangle
declare const __webpack_relative_entrypoint_to_root__: string;
declare const scriptUrl: string;

// eslint-disable-next-line no-undef
__webpack_public_path__ = new URL(scriptUrl.replace(/[^/]+$/, "") + __webpack_relative_entrypoint_to_root__).toString();

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate: ActivationFunction = (context) => ({
  renderOutputItem(outputItem, element) {
    let shadow = element.shadowRoot;
    if (!shadow) {
      shadow = element.attachShadow({ mode: "open" });
      const root = document.createElement("div");
      root.id = "root";
      shadow.append(root);
    }
    const root = shadow.querySelector<HTMLElement>("#root")!;
    errorOverlay.wrap(root, () => {
      root.innerHTML = "";
      const node = document.createElement("div");
      root.appendChild(node);

      render({
        container: node, mime: outputItem.mime, value: outputItem.json(), context,
      });
    });
  },
  disposeOutputItem(outputId) {
    // Do any teardown here. outputId is the cell output being deleted, or
    // undefined if we're clearing all outputs.
  },
});
