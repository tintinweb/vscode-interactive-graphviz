/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
  * */

/** imports */
import * as vscode from "vscode";

/** globals */
export const languageId = "dot";
export const docSelector = {
  language: languageId,
};
export const fileExtension = ".dot";
export const notebookRendererId = "graphviz-interactive-preview";

export function extensionConfig() {
  return vscode.workspace.getConfiguration("graphviz-interactive-preview");
}

export function extensionBaseConfig(id: string) {
  return vscode.workspace.getConfiguration(id);
}

export function extension() {
  return vscode.extensions.getExtension("tintinweb.graphviz-interactive-preview");
}
