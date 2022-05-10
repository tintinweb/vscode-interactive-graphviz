/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { SymbolKind } from "vscode";

// eslint-disable-next-line no-shadow
export enum DotSymbolDefinition {
    Node = SymbolKind.Variable,
    Graph = SymbolKind.Class,
    Edge = SymbolKind.Constructor
}
