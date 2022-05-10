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
import { DotSymbolDefinition } from "./SymbolDefinition";

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

  private astLocationToRange(location: AST.FileRange): Range {
    const range = new Range(
      new Position(location.start.line - 1, location.start.column - 1),
      new Position(location.end.line - 1, location.end.column - 1),
    );
    return range;
  }

  private vsElement(
    node: AST.ASTNode,
    name: string,
    type: string,
    kind: DotSymbolDefinition,
    children?: DocumentSymbolInformation[],
    location?: AST.FileRange,
  ) : DocumentSymbolInformation {
    const range = this.astLocationToRange(location || node.location);
    const ds = new DocumentSymbol(
      name,
      `(${type})`,
      (kind as unknown) as SymbolKind,
      range,
      range,
    );
    if (children) {
      children.forEach((el) => ds.children.push(el));
    }
    (ds as DocumentSymbolInformation).location = new Location(this.uri as Uri, range);
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
      DotSymbolDefinition.Graph,
      this.parseBody(graph),
      graph.id?.location,
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
      DotSymbolDefinition.Edge,
      edge.targets.map((target): DocumentSymbolInformation => this.vsElement(
        target,
        (target.type === "node_ref") ? target.id.value : target.type,
        target.type,
        DotSymbolDefinition.Node,
      )),
    );
  }

  private getNode(node: AST.Node): DocumentSymbolInformation {
    return this.vsElement(
      node,
      node.id.value,
      node.type,
      DotSymbolDefinition.Node,
      undefined,
      node.id.location,
    );
  }
}
