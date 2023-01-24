import * as vscode from "vscode";
import PreviewPanel from "./features/previewPanel";

export type ICommand = {
  document?: vscode.TextDocument;
  uri?: vscode.Uri;
  content?: string;
  // eslint-disable-next-line no-unused-vars
  callback?: (panel: PreviewPanel) => void;
  allowMultiplePanels?: boolean;
  title?: string;
  search?: any;
  displayColumn?: vscode.ViewColumn | {
    viewColumn: vscode.ViewColumn;
    preserveFocus?: boolean | undefined;
  };
};
export const COMMANDSTRING = "graphviz-interactive-preview.preview.beside";
