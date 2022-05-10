import {
  DocumentSymbol,
  DocumentSymbolProvider,
  Location,
  Position,
  ProviderResult,
  Range,
  ReferenceProvider,
  RenameProvider,
  SymbolKind,
  TextDocument,
  WorkspaceEdit,
} from "vscode";

import DotParser, { DocumentSymbolInformation } from "./DotParser";
import { DotSymbolDefinition } from "./SymbolDefinition";

export default class SymbolProvider
implements
    DocumentSymbolProvider,
    RenameProvider,
    ReferenceProvider {
  // eslint-disable-next-line class-methods-use-this
  private lineIterator(
    document: TextDocument,
    regex: RegExp,
    // eslint-disable-next-line no-unused-vars
    func: (
      // eslint-disable-next-line no-unused-vars
      lineNumber: number,
      // eslint-disable-next-line no-unused-vars
      captures: RegExpExecArray,
      // eslint-disable-next-line no-unused-vars
      offset: number
      ) => DocumentSymbolInformation[],
  ) {
    let symbols: DocumentSymbolInformation[] = [];
    for (let line = 0; line < document.lineCount; line += 1) {
      const t = document.lineAt(line).text;
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(t)) != null) {
        const offset = match.index + 1;
        const res = func(line, match, offset);
        symbols = symbols.concat(res);
      }
    }
    return symbols;
  }

  // find node definitions
  // /node\s*\[.*\]\s([\w\d]+|"(?:[^"\\]|\\.)*")/g
  private findExplicitNodeDefinition(document: TextDocument): DocumentSymbolInformation[] {
    const regex = /node\s*\[.*\]\s([\w\d]+|"(?:[^"\\]|\\.)*")/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        capture: RegExpExecArray,
        offset: number,
      ): DocumentSymbolInformation[] => {
        const range = new Range(
          new Position(
            lineNumber,
            offset + capture[0].length - capture[1].length,
          ),
          new Position(
            lineNumber,
            offset + capture[0].length,
          ),
        );
        const location = new Location(document.uri, range);

        const ds = new DocumentSymbol(
          capture[1],
          "node",
          SymbolKind.Variable,
          range,
          range,
        );
        (ds as DocumentSymbolInformation).location = location;
        (ds as DocumentSymbolInformation).containerName = "";
        return [ds as DocumentSymbolInformation];
      },
    );
  }

  // find inline nodes
  // /^\s*((([\w\d]+)\s*)+)(?!.*(=|->|{|\[))/g
  private findNodeDefinition(document: TextDocument): DocumentSymbolInformation[] {
    const regex = /^\s*((([\w\d]+|"(?:[^"\\]|\\.)*")\s*)+)(?!.*(=|->|{|\[))/g;
    const regexSymbol = /([\w\d]+|"(?:[^"\\]|\\.)*")/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        captures: RegExpExecArray,
        offset: number,
      ): DocumentSymbolInformation[] => {
        const symbols: DocumentSymbolInformation[] = [];
        let symbol;
        // eslint-disable-next-line no-cond-assign
        while ((symbol = regexSymbol.exec(captures[0])) != null) {
          const range = new Range(
            new Position(lineNumber, offset + symbol.index - 1),
            new Position(lineNumber, offset + symbol.index - 1 + symbol[0].length),
          );
          const location = new Location(
            document.uri,
            range,
          );
          const ds = new DocumentSymbol(
            symbol[0],
            "node",
            SymbolKind.Variable,
            range,
            range,
          );
          (ds as DocumentSymbolInformation).location = location;
          (ds as DocumentSymbolInformation).containerName = "";
          // return [ds as DocumentSymbolInformation];
          symbols.push(ds as DocumentSymbolInformation);
        }
        return symbols;
      },
    );
  }

  // find Nodes with config
  private findNodeDefinitionWithConfig(document: TextDocument) : DocumentSymbolInformation[] {
    const regex = /(?!\s*node)^\s*(([\w\d]+|"(?:[^"\\]|\\.)*"))\s*\[/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        capture: RegExpExecArray,
        offset: number,
      ): DocumentSymbolInformation[] => {
        const range = new Range(
          new Position(
            lineNumber,
            offset + capture.index + (capture[0].length - capture[0].trim().length) - 1,
          ),
          new Position(
            lineNumber,
            offset + capture.index
          + (capture[0].length - capture[0].trim().length)
          + capture[1].length - 1,
          ),
        );
        const location = new Location(
          document.uri,
          range,
        );

        const ds = new DocumentSymbol(
          capture[1],
          "node",
          SymbolKind.Variable,
          range,
          range,
        );
        (ds as DocumentSymbolInformation).location = location;
        (ds as DocumentSymbolInformation).containerName = "";

        return [ds as DocumentSymbolInformation];
      },
    );
  }

  private findRegularSymbols(document: TextDocument) : DocumentSymbolInformation[] {
    const regex = /([\w\d]+|"(?:[^"\\]|\\.)*")(\s*(->|<-|--)\s*([\w\d]+|"(?:[^"\\]|\\.)*"))+/g;
    const regexSymbol = /[\w\d]+|"(?:[^"\\]|\\.)*"/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        captures: RegExpExecArray,
        offset: number,
      ) : DocumentSymbolInformation[] => {
        const symbols: DocumentSymbolInformation[] = [];
        let symbol;
        // eslint-disable-next-line no-cond-assign
        while ((symbol = regexSymbol.exec(captures[0])) != null) {
          const range = new Range(
            new Position(lineNumber, offset + symbol.index - 1),
            new Position(lineNumber, offset + symbol.index - 1 + symbol[0].length),
          );
          const location = new Location(
            document.uri,
            range,
          );
          const ds = new DocumentSymbol(
            symbol[0],
            "node",
            SymbolKind.Variable,
            range,
            range,
          );
          (ds as DocumentSymbolInformation).location = location;
          (ds as DocumentSymbolInformation).containerName = "";
          symbols.push(ds as DocumentSymbolInformation);
        }
        return symbols;
      },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public provideSymbols(document: TextDocument) : DocumentSymbolInformation[] {
    let symbols : DocumentSymbolInformation[] = [];

    try {
      const dotParser = new DotParser();
      dotParser.parse(document);
      symbols = (dotParser.getVscodeTypedAst() as DocumentSymbolInformation).children;
    } catch (e: any) {
      symbols = symbols.concat(this.findExplicitNodeDefinition(document));
      symbols = symbols.concat(this.findNodeDefinition(document));
      symbols = symbols.concat(this.findRegularSymbols(document));
      symbols = symbols.concat(this.findNodeDefinitionWithConfig(document));
    }

    return symbols;
  }

  // eslint-disable-next-line class-methods-use-this
  public flatSymbols(symbols: DocumentSymbolInformation[]) : DocumentSymbolInformation[] {
    const res : DocumentSymbolInformation[] = [];

    const crawler = (syms: DocumentSymbolInformation[]) => {
      syms.forEach((symbol) => {
        res.push(symbol);
        if (symbol.children && symbol.children.length > 0) {
          crawler(symbol.children);
        }
      });
    };
    crawler(symbols);

    return res;
  }

  public provideDocumentSymbols(
    document: TextDocument,
    // token: CancellationToken,
  ): Promise<DocumentSymbolInformation[]> {
    return Promise.resolve(this.provideSymbols(document));
  }

  // eslint-disable-next-line class-methods-use-this
  private containingSymbol(
    symbols: DocumentSymbolInformation[],
    position: Position,
  ) {
    let closestSymbol: DocumentSymbolInformation|undefined;

    const crawler = (syms: DocumentSymbolInformation[]) => {
      syms.forEach((symbol) => {
        if (symbol.location.range.contains(position)
        && (!closestSymbol || closestSymbol.range.contains(symbol.range))) {
          closestSymbol = symbol;
        }
        if (symbol.children && symbol.children.length > 0) {
          crawler(symbol.children);
        }
      });
    };

    crawler(symbols);
    return closestSymbol;
  }

  public prepareRename(
    document: TextDocument,
    position: Position,
    // token: CancellationToken
  ): ProviderResult<Range | { range: Range; placeholder: string }> {
    const symbols = this.provideSymbols(document);
    const renameSymbol = this.containingSymbol(symbols, position);
    if (!renameSymbol
      || !((
        ([DotSymbolDefinition.Node, DotSymbolDefinition.Graph] as unknown[] as SymbolKind[])
      )).includes(renameSymbol.kind)) {
      return Promise.reject(new Error("This can not be renamed."));
    }

    return {
      range: renameSymbol.location.range,
      placeholder: renameSymbol.name[0] === "\"" && renameSymbol.name[renameSymbol.name.length - 1] === "\"" ? renameSymbol.name.substring(1, renameSymbol.name.length - 1) : renameSymbol.name,
    };
  }

  public provideRenameEdits(
    document: TextDocument,
    position: Position,
    newName: string,
  // token: CancellationToken,
  ):
    Promise<WorkspaceEdit> {
    return this.provideReferences(document, position).then((locations) => {
      const edit:WorkspaceEdit = new WorkspaceEdit();

      let newSymbolName = newName;
      if (!newName.match(/^[\w\d]+$/) && !(newName[0] === "\"" && newName[newName.length - 1] === "\"")) {
        newSymbolName = `"${newName.replace(/\\{0,1}"/g, "\\\"")}"`;
      }

      locations.forEach((l) => edit.replace(document.uri, l.range, newSymbolName));
      return edit;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public provideReferences(
    document: TextDocument,
    position: Position,
    // options: { includeDeclaration: boolean },
    // token: CancellationToken,
  ):
    Promise<Location[]> {
    const symbols = this.provideSymbols(document);
    const findSymbol = this.containingSymbol(symbols, position);
    if (!findSymbol || !((
      ([DotSymbolDefinition.Node, DotSymbolDefinition.Graph] as unknown[] as SymbolKind[])
    )).includes(findSymbol.kind)) {
      return Promise.reject();
    }
    const locations : Location[] = [];
    const flatSymbols = this.flatSymbols(symbols);
    flatSymbols.forEach((symbol) => {
      if (findSymbol.name === symbol.name) {
        locations.push(symbol.location);
      }
    });
    return Promise.resolve(locations);
  }
}
