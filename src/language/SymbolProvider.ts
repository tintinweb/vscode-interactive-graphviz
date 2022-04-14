import {
  DocumentSymbolProvider,
  Location,
  Position,
  ProviderResult,
  Range,
  ReferenceProvider,
  RenameProvider,
  SymbolInformation,
  SymbolKind,
  TextDocument,
  WorkspaceEdit,
} from "vscode";

import DotParser from "./DotParser";

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
    func: (lineNumber: number, captures: RegExpExecArray, offset: number) => SymbolInformation[],
  ) {
    let symbols: SymbolInformation[] = [];
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
  private findExplicitNodeDefinition(document: TextDocument): SymbolInformation[] {
    const regex = /node\s*\[.*\]\s([\w\d]+|"(?:[^"\\]|\\.)*")/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        capture: RegExpExecArray,
        offset: number,
      ): SymbolInformation[] => [new SymbolInformation(
        capture[1],
        SymbolKind.Variable,
        "",
        new Location(
          document.uri,
          new Range(
            new Position(
              lineNumber,
              offset + capture[0].length - capture[1].length,
            ),
            new Position(
              lineNumber,
              offset + capture[0].length,
            ),
          ),
        ),
      )],
    );
  }

  // find inline nodes
  // /^\s*((([\w\d]+)\s*)+)(?!.*(=|->|{|\[))/g
  private findNodeDefinition(document: TextDocument): SymbolInformation[] {
    const regex = /^\s*((([\w\d]+|"(?:[^"\\]|\\.)*")\s*)+)(?!.*(=|->|{|\[))/g;
    const regexSymbol = /([\w\d]+|"(?:[^"\\]|\\.)*")/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        captures: RegExpExecArray,
        offset: number,
      ): SymbolInformation[] => {
        const symbols: SymbolInformation[] = [];
        let symbol;
        // eslint-disable-next-line no-cond-assign
        while ((symbol = regexSymbol.exec(captures[0])) != null) {
          symbols.push(
            new SymbolInformation(
              symbol[0],
              SymbolKind.Variable,
              "",
              new Location(
                document.uri,
                new Range(
                  new Position(lineNumber, offset + symbol.index - 1),
                  new Position(lineNumber, offset + symbol.index - 1 + symbol[0].length),
                ),
              ),
            ),
          );
        }
        return symbols;
      },
    );
  }

  // find Nodes with config
  private findNodeDefinitionWithConfig(document: TextDocument) : SymbolInformation[] {
    const regex = /(?!\s*node)^\s*(([\w\d]+|"(?:[^"\\]|\\.)*"))\s*\[/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        capture: RegExpExecArray,
        offset: number,
      ): SymbolInformation[] => [new SymbolInformation(
        capture[1],
        SymbolKind.Variable,
        "",
        new Location(
          document.uri,
          new Range(
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
          ),
        ),
      )],
    );
  }

  private findRegularSymbols(document: TextDocument) : SymbolInformation[] {
    const regex = /([\w\d]+|"(?:[^"\\]|\\.)*")(\s*(->|<-|--)\s*([\w\d]+|"(?:[^"\\]|\\.)*"))+/g;
    const regexSymbol = /[\w\d]+|"(?:[^"\\]|\\.)*"/g;

    return this.lineIterator(
      document,
      regex,
      (
        lineNumber: number,
        captures: RegExpExecArray,
        offset: number,
      ) : SymbolInformation[] => {
        const symbols: SymbolInformation[] = [];
        let symbol;
        // eslint-disable-next-line no-cond-assign
        while ((symbol = regexSymbol.exec(captures[0])) != null) {
          symbols.push(
            new SymbolInformation(
              symbol[0],
              SymbolKind.Variable,
              "",
              new Location(
                document.uri,
                new Range(
                  new Position(lineNumber, offset + symbol.index - 1),
                  new Position(lineNumber, offset + symbol.index - 1 + symbol[0].length),
                ),
              ),
            ),
          );
        }
        return symbols;
      },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public provideSymbols(document: TextDocument) : SymbolInformation[] {
    let symbols : SymbolInformation[] = [];

    try {
      const dotParser = new DotParser();
      dotParser.parse(document);
      symbols = dotParser.getVscodeTypedAst().children;
    } catch (e: any) {
      symbols = symbols.concat(this.findExplicitNodeDefinition(document));
      symbols = symbols.concat(this.findNodeDefinition(document));
      symbols = symbols.concat(this.findRegularSymbols(document));
      symbols = symbols.concat(this.findNodeDefinitionWithConfig(document));
    }

    return symbols;
  }

  public provideDocumentSymbols(
    document: TextDocument,
    // token: CancellationToken,
  ): Promise<SymbolInformation[]> {
    return Promise.resolve(this.provideSymbols(document));
  }

  // eslint-disable-next-line class-methods-use-this
  private containingSymbol(symbols: SymbolInformation[], position: Position) {
    let renameSymbol: SymbolInformation|undefined;
    symbols.forEach((symbol) => {
      if (symbol.location.range.contains(position)) {
        renameSymbol = symbol;
      }
    });
    return renameSymbol;
  }

  public prepareRename(
    document: TextDocument,
    position: Position,
    // token: CancellationToken
  ): ProviderResult<Range | { range: Range; placeholder: string }> {
    const symbols = this.provideSymbols(document);
    const renameSymbol = this.containingSymbol(symbols, position);
    if (!renameSymbol) {
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
    return this.provideDocumentSymbols(document).then((symbols) => {
      const edit:WorkspaceEdit = new WorkspaceEdit();

      const renameSymbol = this.containingSymbol(symbols, position);
      if (!renameSymbol) {
        return Promise.reject();
      }

      let newSymbolName = newName;
      if (!newName.match(/^[\w\d]+$/) && !(newName[0] === "\"" && newName[newName.length - 1] === "\"")) {
        newSymbolName = `"${newName.replace(/\\{0,1}"/g, "\\\"")}"`;
      }

      symbols.forEach((symbol) => {
        if (renameSymbol?.name === symbol.name) {
          edit.replace(
            document.uri,
            symbol.location.range,
            newSymbolName,
          );
        }
      });

      return Promise.resolve(edit);
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
    return this.provideDocumentSymbols(document).then((symbols) => {
      const findSymbol = this.containingSymbol(symbols, position);
      if (!findSymbol) {
        return Promise.reject();
      }
      const locations : Location[] = [];
      symbols.forEach((symbol) => {
        if (findSymbol?.name === symbol.name) {
          locations.push(symbol.location);
        }
      });
      return Promise.resolve(locations);
    });
  }
}
