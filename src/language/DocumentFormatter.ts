import { parse } from "@ts-graphviz/parser";
import { toDot } from "ts-graphviz";
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

export default class DotDocumentFormatter implements DocumentFormattingEditProvider {
  // eslint-disable-next-line class-methods-use-this
  provideDocumentFormattingEdits(
    document: TextDocument,
    // options: FormattingOptions,
    // token: CancellationToken,
  ): ProviderResult<TextEdit[]> {
    try {
      const d = parse(document.getText());
      const dot = toDot(d);

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
