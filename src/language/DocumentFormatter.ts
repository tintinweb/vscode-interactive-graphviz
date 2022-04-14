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
} from "vscode";

export default class DotDocumentFormatter implements DocumentFormattingEditProvider {
  // eslint-disable-next-line class-methods-use-this
  provideDocumentFormattingEdits(
    document: TextDocument,
    // options: FormattingOptions,
    // token: CancellationToken,
  ): ProviderResult<TextEdit[]> {
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
  }
}
