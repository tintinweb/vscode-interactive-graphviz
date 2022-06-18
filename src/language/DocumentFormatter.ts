/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { AST } from "@ts-graphviz/parser";
import {
  DocumentFormattingEditProvider,
  // FormattingOptions,
  Position,
  ProviderResult,
  Range,
  TextDocument,
  TextEdit,
  window,
} from "vscode";
import { extensionBaseConfig, extensionConfig } from "../settings";

class Compiler {
  protected directed: boolean;

  protected indentSize: number;

  protected condense: boolean;

  constructor({ directed = true, indentSize = 2, condense = true } = {}) {
    this.directed = directed;
    this.indentSize = indentSize;
    this.condense = condense;
  }

  protected indent(line: string): string {
    return line.split("\n").map((l) => " ".repeat(this.indentSize) + l).join("\n");
  }

  // eslint-disable-next-line no-unused-vars
  protected pad(pad: string): (l: string) => string {
    return (l: string) => pad + l;
  }

  protected printAttribute(ast: AST.Attribute): string {
    return `${this.stringify(ast.key)} = ${this.stringify(ast.value)};`;
  }

  protected printAttributes(ast: AST.Attributes): string {
    return ast.body.length === 0
      ? `${ast.kind};`
      : `${ast.kind} [${this.condense ? "" : "\n"}${ast.body.map(this.stringify.bind(this)).map(this.condense ? (i) => i : this.indent.bind(this)).join(this.condense ? " " : "\n")}${this.condense ? "" : "\n"}];`;
  }

  protected printComment(ast: AST.Comment): string {
    switch (ast.kind) {
    case AST.Comment.Kind.Block:
      return `/**\n${ast.value.split("\n").map(this.pad(" * ")).join("\n")}\n */`;
    case AST.Comment.Kind.Slash:
      return ast.value.split("\n").map(this.pad("// ")).join("\n");
    case AST.Comment.Kind.Macro:
      return ast.value.split("\n").map(this.pad("# ")).join("\n");
    default: throw new Error("Unknown comment type");
    }
  }

  protected printDot(ast: AST.Dot): string {
    return ast.body.map(this.stringify.bind(this)).join("\n");
  }

  protected printEdge(ast: AST.Edge): string {
    const targets = ast.targets.map(this.stringify.bind(this)).join(this.directed ? " -> " : " -- ");
    return ast.body.length === 0
      ? `${targets};`
      : `${targets} [${this.condense ? "" : "\n"}${ast.body.map(this.stringify.bind(this)).map(this.condense ? (i) => i : this.indent.bind(this)).join(this.condense ? " " : "\n")}${this.condense ? "" : "\n"}];`;
  }

  protected printNode(ast: AST.Node): string {
    return ast.body.length === 0
      ? `${this.stringify(ast.id)};`
      : `${this.stringify(ast.id)} [${this.condense ? "" : "\n"}${ast.body
        .map(this.stringify.bind(this))
        .map(this.condense ? (i) => i : this.indent.bind(this))
        .join(this.condense ? "" : "\n")}${this.condense ? "" : "\n"}];`;
  }

  protected printNodeRef(ast: AST.NodeRef): string {
    return [
      this.stringify(ast.id),
      ast.port ? this.stringify(ast.port) : null,
      ast.compass ? this.stringify(ast.compass) : null,
    ]
      .filter((v) => v !== null)
      .join(":");
  }

  protected printNodeRefGroup(ast: AST.NodeRefGroup): string {
    return `{${ast.body.map(this.stringify.bind(this)).join(" ")}}`;
  }

  protected printGroup(ast: AST.Graph): string {
    return [
      ast.strict ? "strict" : null,
      ast.directed ? "digraph" : "graph",
      ast.id ? this.stringify(ast.id) : null,
      ast.body.length === 0
        ? "{}"
        : `{\n${ast.body
          .reduce((acc:{res: string[], lastLine:number}, cur) => {
            if (acc.lastLine < cur.location.start.line) {
              for (let i = 0; i < cur.location.start.line - acc.lastLine - 1; i += 1) {
                acc.res.push("");
              }
            }
            acc.lastLine = ((cur.type === "edge")
             || (cur.type === "comment" && cur.kind === "slash")) ? cur.location.start.line : cur.location.end.line;
            acc.res.push(this.stringify(cur));
            return acc;
          }, { res: [], lastLine: Infinity })
          .res
          .map(this.indent.bind(this)).join("\n")}\n}`,
    ]
      .filter((v) => v !== null)
      .join(" ");
  }

  protected printSubgraph(ast: AST.Subgraph): string {
    return [
      "subgraph",
      ast.id ? this.stringify(ast.id) : null,
      ast.body.length === 0
        ? "{}"
        : `{\n${ast.body
          .reduce((acc:{res: string[], lastLine:number}, cur) => {
            if (acc.lastLine < cur.location.start.line) {
              for (let i = 0; i < cur.location.start.line - acc.lastLine - 1; i += 1) {
                acc.res.push("");
              }
            }
            acc.lastLine = (cur.type === "comment" && cur.kind === "slash") ? cur.location.start.line : cur.location.end.line;
            acc.res.push(this.stringify(cur));
            return acc;
          }, { res: [], lastLine: Infinity })
          .res
          .map(this.indent.bind(this)).join("\n")}\n}`,
    ]
      .filter((v) => v !== null)
      .join(" ");
  }

  protected printLiteral(ast: AST.Literal): string {
    switch (ast.quoted) {
    case true:
      return `"${ast.value.replace(/"/g, "\\\"")}"`;
    case false:
      return ast.value;
    case "html":
      return `<${ast.value}>`;
    default: throw new Error("Unknown literal type");
    }
  }

  public stringify(ast: AST.ASTNode): string {
    switch (ast.type) {
    case AST.Types.Attribute:
      return this.printAttribute(ast);
    case AST.Types.Attributes:
      return this.printAttributes(ast);
    case AST.Types.Comment:
      return this.printComment(ast);
    case AST.Types.Dot:
      return this.printDot(ast);
    case AST.Types.Edge:
      return this.printEdge(ast);
    case AST.Types.Node:
      return this.printNode(ast);
    case AST.Types.NodeRef:
      return this.printNodeRef(ast);
    case AST.Types.NodeRefGroup:
      return this.printNodeRefGroup(ast);
    case AST.Types.Graph:
      this.directed = ast.directed;
      return this.printGroup(ast);
    case AST.Types.Subgraph:
      return this.printSubgraph(ast);
    case AST.Types.Literal:
      return this.printLiteral(ast);
    default: throw new Error("Unknown AST type");
    }
  }
}

export default class DotDocumentFormatter implements DocumentFormattingEditProvider {
  // eslint-disable-next-line class-methods-use-this
  provideDocumentFormattingEdits(
    document: TextDocument,
    // options: FormattingOptions,
    // token: CancellationToken,
  ): ProviderResult<TextEdit[]> {
    try {
      const d = AST.parse(document.getText());
      const dot = new Compiler({
        condense: extensionConfig().get("format.condenseAttributes"),
        indentSize: extensionBaseConfig("editor").get("tabSize"),
      }).stringify(d);

      const edit: TextEdit[] = [];
      edit.push(new TextEdit(
        new Range(
          new Position(0, 0),
          new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length),
        ),
        dot,
      ));
      return edit;
    } catch (e: any) {
      // (parser error) don't bubble up as a pot. unhandled thenable promise;
      // explicitly return "no change" instead.
      // show error message
      window.showErrorMessage(`${e.name} (@${e.location.start.line}:${e.location.start.column}): ${e.message}`);
      return undefined;
    }
  }
}
