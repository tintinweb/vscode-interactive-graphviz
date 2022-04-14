/* eslint-disable class-methods-use-this */

import {
  DocumentSymbol,
  SymbolKind,
  Range,
  TextDocument,
  Position,
} from "vscode";

import { AST } from "@ts-graphviz/parser";

export default class DotParser {
  public ast: any = {};

  public parse(document : TextDocument) {
    this.ast = AST.parse(document.getText());
  }

  public getVscodeTypedAst() : any {
    return this.nodeToVscodeSymbolTree(this.ast);
  }

  private nodeToVscodeSymbolTree(root: any) : any {
    const vscodeNode = this.astNodeAsVscodeSymbol(root);

    if (!root.body) {
      return vscodeNode;
    }
    root.body.forEach(
      (e: any) => {
        vscodeNode.children.push(this.nodeToVscodeSymbolTree(e));
      },
    );
    return vscodeNode;
  }

  private astNodeAsVscodeSymbol(node : any) {
    const loc = new Range(
      new Position(node.location.start.line - 1, node.location.start.column),
      new Position(node.location.end.line - 1, node.location.end.column),
    );
    return new DocumentSymbol(
      this.getNodeName(node),
      `(${node.type})`,
      this.getVscodeSymbolTypeForAstNode(node),
      loc,
      loc,
    );
  }

  private getVscodeSymbolTypeForAstNode(node : any) : SymbolKind {
    switch (node.type) {
    case "dot": return SymbolKind.Module;
    case "subgraph":
    case "graph": return SymbolKind.Class;
    case "node": return SymbolKind.Method;
    case "edge": return SymbolKind.Function;
    case "attributes": return SymbolKind.Object;
    case "attribute": return SymbolKind.Variable;
    default: return 0;
    }
  }

  private getNodeName(node : any) : string {
    switch (node.type) {
    case "dot": return node.type;
    case "subgraph":
    case "graph": return `${node.directed ? "di" : ""}${node.type}`;
    case "node": return this.getTypedPropertyName(node.id);
    case "edge":
      return node.targets.map((t: any) => this.getTypedPropertyName(t.id)).join(" -> ");
    case "attributes": return node.kind;
    case "attribute":
      return `${this.getTypedPropertyName(node.key)}: ${this.getTypedPropertyName(node.value)}`;
    default: return node.type;
    }
  }

  private getTypedPropertyName(prop : any) : string {
    return prop.type === "literal" ? prop.value : JSON.stringify(prop.value);
  }
}
