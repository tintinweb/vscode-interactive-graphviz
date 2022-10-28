import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  ExtensionContext,
  MarkdownString,
  Position,
  SnippetString,
  SymbolKind,
  TextDocument,
} from "vscode";

import { isNumber, uniq } from "lodash";
import { Utils } from "vscode-uri";
import attributeList from "./definitions/attributelist";
import colors from "./definitions/colors";
import arrowType from "./definitions/arrowType";

import dirType from "./definitions/dirType";
import nodeShapes from "./definitions/nodeShapes";
import style from "./definitions/style";
import SymbolProvider from "./SymbolProvider";
import { DotSymbolDefinition } from "./SymbolDefinition";
import getAttributeDetail from "./getAttributeDetail";

export default class DotCompletionItemProvider implements CompletionItemProvider {
  private colors: CompletionItem[] = [];

  private arrowType: CompletionItem[] = [];

  private nodeShapes: CompletionItem[] = [];

  private dirType: CompletionItem[] = [];

  private compass: CompletionItem[] = [];

  private style: CompletionItem[] = [];

  private primitives: CompletionItem[] = [];

  private rankDir: CompletionItem[] = [];

  private attributes: {"G": CompletionItem[], "N": CompletionItem[], "E": CompletionItem[], "C": CompletionItem[], "S": CompletionItem[]} = {
    G: [],
    N: [],
    E: [],
    C: [],
    S: [],
  };

  private specialAttributes: {[attribute: string] : string} = {};

  constructor(context: ExtensionContext) {
    /* const names = {
      G: "Root graph",
      N: "Nodes",
      E: "Edges",
      C: "Clusters",
      S: "Subgraphs",
    }; */

    this.primitives = "node|edge|graph".split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      pack.insertText = new SnippetString(`${type} [$1]`);
      return pack;
    });

    this.colors = colors.split("\n").map((color) => {
      const [name, value] = color.split("#");
      const pack = new CompletionItem(name, CompletionItemKind.Color);
      pack.documentation = `#${value}`;
      return pack;
    });
    this.arrowType = arrowType.split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      return pack;
    });
    this.dirType = dirType.split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      return pack;
    });
    this.compass = "n|ne|e|se|s|sw|w|nw|c|_".split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      return pack;
    });
    this.nodeShapes = nodeShapes.split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      pack.documentation = new MarkdownString(`![image](${Utils.joinPath(context.extensionUri, `images/shapes/${type}.gif`)})
      `);
      return pack;
    });
    this.style = style.split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      return pack;
    });
    this.rankDir = "TB|LR|RL|BT".split("|").map((type) => {
      const pack = new CompletionItem(type, CompletionItemKind.Constant);
      return pack;
    });

    attributeList.split("\n").forEach((al) => {
      // eslint-disable-next-line no-unused-vars
      const [attribute, typeList, datatype, ...other] = al.split("|");
      const item = new CompletionItem(attribute, CompletionItemKind.Property);
      item.insertText = `${attribute}=`;
      if (datatype) {
        if (datatype === "string" || datatype === "lblString" || datatype === "escString") {
          item.insertText = new SnippetString(`${item.insertText}"$1"`);
        } else if (datatype === "double") {
          if (other.length > 0 && isNumber(other[0])) {
            item.insertText = new SnippetString(`${item.insertText}\${1:${other[0]}}`);
          } else {
            item.insertText = new SnippetString(`${item.insertText}\${1:1.0}`);
          }
        } else if (datatype === "int") {
          if (other.length > 0 && isNumber(other[0])) {
            item.insertText = new SnippetString(`${item.insertText}\${1:${other[0]}}`);
          } else {
            item.insertText = new SnippetString(`${item.insertText}\${1:1}`);
          }
        } else if (datatype === "bool") {
          if (other.length > 0) {
            item.insertText = new SnippetString(`${item.insertText}\${1:${other[0]}}`);
          } else {
            item.insertText = new SnippetString(`${item.insertText}\${1:true}`);
          }
        } else if (datatype !== "") {
          this.specialAttributes[attribute] = datatype;
        }
      }
      item.documentation = getAttributeDetail(attribute) || "";

      // item.documentation = "Available on:";
      for (let i = 0; i < typeList.length; i += 1) {
        (this.attributes as any)[typeList[i] as string].push(item);
        // item.documentation += `\n${(names as any)[typeList[i]]}`;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private provideSymbols(
    document: TextDocument,
    position: Position,
  ): CompletionItem[] {
    const symProv = new SymbolProvider();
    const symbols = symProv.flatSymbols(symProv.provideSymbols(document));

    const suggestions: CompletionItem[] = [];
    const foundSymbols: string[] = [];

    symbols.forEach((symbol) => {
      if (!((
        ([DotSymbolDefinition.Node, DotSymbolDefinition.Graph] as unknown[] as SymbolKind[])
      )).includes(symbol.kind)) {
        return;
      }
      if (symbol.range.contains(position)) {
        return;
      }
      if (foundSymbols.includes(symbol.name)) {
        return;
      }
      foundSymbols.push(symbol.name);
      suggestions.push(new CompletionItem(symbol.name, CompletionItemKind.Variable));
    });

    return suggestions;
  }

  provideCompletionItems(
    document: TextDocument,
    position: Position,
    // token: CancellationToken,
    // context: CompletionContext,
  ) : CompletionItem[] | undefined {
    const line = document.lineAt(position.line).text.substring(0, position.character);

    let suggestions = this.provideSymbols(document, position);

    const reg = [
      {
        regex: /^\s*([a-zA-Z])*$/,
        // ToDo: Filter already set attributes
        func: () => this.attributes.G,
      },
      {
        regex: /^\s*$/,
        // ToDo: Filter already set attributes
        func: () => this.primitives,
      },
      {
        regex: /(node|[a-zA-Z0-9]+)\s*\[\s*([a-z]+\s*=\s*((".*")|([a-zA-Z0-9.]+))\s+)*$/,
        func: (r:string[]) => {
          // ToDo: Filter already set attributes
          if (r[1] === "edge" || r[1] === "graph") {
            return [];
          }
          return this.attributes.N;
        },
      },
      {
        regex: /graph\s*\[\s*([a-z]+\s*=\s*((".*")|([a-zA-Z0-9.]+))\s+)*$/,
        func: () => this.attributes.G,
        // ToDo: Filter already set attributes
      },
      {
        regex: /edge\s*\[\s*([a-z]+\s*=\s*((".*")|([a-zA-Z0-9.]+))\s+)*$/,
        func: () => this.attributes.E,
        // ToDo: Filter already set attributes
      },
      {
        regex: /[a-z0-9]+:$/,
        func: () => this.compass,
      },
      {
        regex: /([a-z]+[1]?)\s*=\s*[a-zA-Z]*$/,
        func: (res : string[]) => {
          const attribute = res[1];
          const type = this.specialAttributes[attribute];
          if (!type) return [];

          if (type === "color") {
            return this.colors;
          } if (type === "arrowType") {
            return this.arrowType;
          } if (type === "dirType") {
            return this.dirType;
          } if (type === "shape") {
            return this.nodeShapes;
          } if (type === "style") {
            return this.style;
          } if (type === "rankDir") {
            return this.rankDir;
          }
          return [];
        },
      },
    ];

    reg.forEach((el) => {
      const result = line.match(el.regex);
      if (result) {
        suggestions = suggestions.concat(el.func(result));
      }
    });

    return uniq(suggestions);
  }
}
