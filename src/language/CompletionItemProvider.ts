import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, Position, Range, TextDocument } from "vscode";
import colors from "./colors";

export default class DotCompletionItemProvider implements CompletionItemProvider{
    private colors: CompletionItem[] = [];

    constructor() {
        this.colors = colors.split("\n").map(color => {
            const [name, value] = color.split("#");
            const pack = new CompletionItem(name, CompletionItemKind.Color);
            pack.documentation = "#"+value;
            return pack;
        })
    }

    provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    )  : CompletionItem[] | undefined {
        const line = document.lineAt(position.line).text.substring(0, position.character);

        const reg = [
            {regex: /color\s*=\s*[a-zA-Z]*$/,
            func: () => this.colors},
        ]

        let suggestions: CompletionItem[] = []

        reg.forEach((el) => {
            const result = line.match(el.regex);
            if (result) {
                suggestions = this.colors;
            }
        });
       
        return suggestions;
    }
  }