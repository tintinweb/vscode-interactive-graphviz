/* eslint-disable class-methods-use-this */

import {
  DocumentSymbol,
  SymbolKind,
  Range,
  TextDocument,
  Position,
  SymbolTag,
  Location,
  Uri,
} from "vscode";

import { AST } from "@ts-graphviz/parser";

export type DocumentSymbolInformation = {
    /**
    * The name of this symbol.
    */
    name: string;

    /**
    * More detail for this symbol, e.g. the signature of a function.
    */
    detail: string;

    /**
    * The kind of this symbol.
    */
    kind: SymbolKind;

    /**
    * Tags for this symbol.
    */
    tags?: readonly SymbolTag[];

    /**
    * The range enclosing this symbol not including leading/
    * trailing whitespace but everything else, e.g. comments and code.
    */
    range: Range;

    /**
    * The range that should be selected and reveal when this symbol is
    * being picked, e.g. the name of a function.
    * Must be contained by the {@linkcode DocumentSymbol.range range}.
    */
    selectionRange: Range;

    /**
    * Children of this symbol, e.g. properties of a class.
    */
    children: DocumentSymbolInformation[];

    /**
    * The name of the symbol containing this symbol.
    */
    containerName: string;

    /**
    * The location of this symbol.
    */
    location: Location;
}

export default class DotParser {
  public ast: AST.ASTNode | undefined = undefined;

  private uri?: Uri = undefined;

  public parse(document : TextDocument) {
    this.ast = AST.parse(document.getText());
    this.uri = document.uri;
  }

  public getVscodeTypedAst() : DocumentSymbolInformation|undefined {
    if (!this.ast) return undefined;
    // return this.nodeToVscodeSymbolTree(this.ast);
    return this.getElement(this.ast);
  }

  private getElement(element: AST.ASTNode) : DocumentSymbolInformation | undefined {
    switch (element.type) {
    case "attribute":
    case "attributes":
    case "comment": return undefined;
    case "dot": return this.getDot(element);
    case "edge": return this.getEdge(element);
    case "subgraph":
    case "graph": return this.getGraph(element);
    case "literal": return undefined;
    case "node": return this.getNode(element);
    case "node_ref":
    case "node_ref_group": return undefined;
    default:
      break;
    }
    throw new Error("Unknown element type!");
  }

  private vsElement(
    node: AST.ASTNode,
    name: string,
    type: string,
    kind: SymbolKind,
    children?: DocumentSymbolInformation[],
  ) : DocumentSymbolInformation {
    const loc = new Range(
      new Position(node.location.start.line - 1, node.location.start.column - 1),
      new Position(node.location.end.line - 1, node.location.end.column - 1),
    );
    const ds = new DocumentSymbol(
      name,
      `(${type})`,
      kind,
      loc,
      loc,
    );
    if (children) {
      children.forEach((el) => ds.children.push(el));
    }
    (ds as DocumentSymbolInformation).location = new Location(this.uri as Uri, loc);
    (ds as DocumentSymbolInformation).containerName = "";
    return ds as DocumentSymbolInformation;
  }

  private parseBody(node: AST.ASTBaseParent<AST.ASTNode>) : DocumentSymbolInformation[] {
    return node.body
      .map((el) => this.getElement(el))
      .filter((i) => i !== undefined) as DocumentSymbolInformation[];
  }

  private getDot(dot: AST.Dot) : DocumentSymbolInformation {
    return this.getElement(dot.body[0]) as DocumentSymbolInformation;
  }

  private getGraph(graph: AST.Graph | AST.Subgraph) : DocumentSymbolInformation {
    return this.vsElement(
      graph,
      graph.id?.value || graph.type,
      graph.type,
      SymbolKind.Class,
      this.parseBody(graph),
    );
  }

  private getEdge(edge: AST.Edge) : DocumentSymbolInformation {
    return this.vsElement(
      edge,
      edge.targets.map((target) => {
        if (target.type === "node_ref") {
          return target.id.value;
        }
        return target.type;
      }).join(" -> "),
      edge.type,
      SymbolKind.Class,
      edge.targets.map((target): DocumentSymbolInformation => this.vsElement(
        target,
        (target.type === "node_ref") ? target.id.value : target.type,
        target.type,
        SymbolKind.Variable,
      )),
    );
  }

  private getNode(node: AST.Node): DocumentSymbolInformation {
    return this.vsElement(
      node,
      node.id.value,
      node.type,
      SymbolKind.Variable,
    );
  }

  /* private nodeToVscodeSymbolTree(root: AST.ASTNode) : DocumentSymbolInformation {
    const vscodeNode = this.astNodeAsVscodeSymbol(root);

    if (!root.body) {
      return vscodeNode;
    }
    root.body.forEach(
      (e: AST.DotStatement) => {
        vscodeNode.children.push(this.nodeToVscodeSymbolTree(e));
      },
    );
    return vscodeNode;
  }

  private astNodeAsVscodeSymbol(node : AST.ASTNode): DocumentSymbolInformation {
    const loc = new Range(
      new Position(node.location.start.line - 1, node.location.start.column),
      new Position(node.location.end.line - 1, node.location.end.column),
    );
    const ds = new DocumentSymbol(
      this.getNodeName(node),
      `(${node.type})`,
      this.getVscodeSymbolTypeForAstNode(node),
      loc,
      loc,
    );
    (ds as DocumentSymbolInformation).location = new Location(this.uri as Uri, loc);
    (ds as DocumentSymbolInformation).containerName = "";
    return ds as DocumentSymbolInformation;
  }

  private getVscodeSymbolTypeForAstNode(node : AST.ASTNode) : SymbolKind {
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

  private getNodeName(node : AST.ASTNode) : string {
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
  } */
}
