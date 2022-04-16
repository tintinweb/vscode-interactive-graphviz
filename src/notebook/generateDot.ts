import { OutputItem } from "vscode-notebook-renderer";

const mimeTypes = {
  "application/json": "json",
  "application/json+graphviz-interactive-preview": "json",
  "text/plain": "dot",
  "text/x-json": "json",
  "text/x-graphviz": "dot",
  "text/x-dot": "dot",
};

export default function generateDot(output: OutputItem) : string|undefined {
  return undefined;
}
