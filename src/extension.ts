/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
  * */

/** imports */
import * as vscode from "vscode";
import InteractiveWebviewGenerator from "./features/interactiveWebview";
import PreviewPanel from "./features/previewPanel";
import DotCompletionItemProvider from "./language/CompletionItemProvider";
import * as settings from "./settings";

/** global vars */

/** classdecs */

/** funcdecs */

/** event funcs */
function onActivate(context: vscode.ExtensionContext) {
  const graphvizView = new InteractiveWebviewGenerator(context);

  /* Document Events */

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.languageId === settings.languageId
        || event.document.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
      const panel = graphvizView.getPanel(event.document.uri);
      if (panel) {
        panel.requestRender(event.document.getText());
      }
    }
  }, null, context.subscriptions);

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
    if (doc.languageId === settings.languageId
        || doc.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
      const panel = graphvizView.getPanel(doc.uri);
      if (panel) {
        panel.requestRender(doc.getText());
      }
    }
  }));

  /* commands */

  context.subscriptions.push(
    vscode.commands.registerCommand("graphviz-interactive-preview.preview.beside", (a) => {
      // take document or string; default active editor if
      const args = a || {};
      const options = {
        document: args.document,
        content: args.content,
        callback: args.callback,
        allowMultiplePanels: args.allowMultiplePanels,
        title: args.title,
        search: args.search,
      };

      if (!options.content && !options.document && vscode.window.activeTextEditor?.document) {
        options.document = vscode.window.activeTextEditor.document;
      }

      if (!options.content && options.document) {
        options.content = options.document.getText();
      }

      graphvizView.revealOrCreatePreview(vscode.ViewColumn.Beside, options.document, options)
        .then((webpanel : PreviewPanel) => {
          // trigger dot render on page load success
          // just in case webpanel takes longer to load, wait for page
          // to ping back and perform action
          // eslint-disable-next-line no-param-reassign
          webpanel.waitingForRendering = options.content;
          // eslint-disable-next-line no-param-reassign
          webpanel.search = options.search;

          // allow caller to handle messages by providing them with the newly created webpanel
          // e.g. caller can override webpanel.handleMessage = function(message){};
          if (options.callback) {
            options.callback(webpanel);
          }
        });
    }),
  );

  /* add. providers */

  if (settings.extensionConfig().codeCompletion.enable as boolean) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
      [settings.languageId],
      new DotCompletionItemProvider(),
      "=",
      "[",
      " ",
      "\n",
      "{",
      ":",
    ));
  }
}

/* exports */
exports.activate = onActivate;
