/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
  * */

/** imports */
import {
  commands, ExtensionContext, languages, NotebookRendererMessaging, notebooks, ViewColumn, window, workspace,
} from "vscode";
import InteractiveWebviewGenerator from "./features/interactiveWebview";
import PreviewPanel from "./features/previewPanel";
import saveFile from "./features/saveFile";
import ColorProvider from "./language/ColorProvider";
import DotCompletionItemProvider from "./language/CompletionItemProvider";
import DotHoverProvider from "./language/HoverProvider";
import SymbolProvider from "./language/SymbolProvider";
import * as settings from "./settings";

function onActivate(context: ExtensionContext) {
  const graphvizView = new InteractiveWebviewGenerator(context);

  /* Document Events */

  workspace.onDidChangeTextDocument((event) => {
    if (event.document.languageId === settings.languageId
        || event.document.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
      const panel = graphvizView.getPanel(event.document.uri);
      if (panel) {
        panel.requestRender(event.document.getText());
      }
    }
  }, null, context.subscriptions);

  context.subscriptions.push(workspace.onDidSaveTextDocument((doc) => {
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
    commands.registerCommand("graphviz-interactive-preview.preview.beside", (a) => {
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

      if (!options.content && !options.document && window.activeTextEditor?.document) {
        options.document = window.activeTextEditor?.document;
      }

      if (!options.content && options.document) {
        options.content = options.document.getText();
      }

      graphvizView.revealOrCreatePreview(ViewColumn.Beside, options.document, options)
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

  /* notebook messaging */
  const messageChannel: NotebookRendererMessaging = notebooks
    .createRendererMessaging(settings.notebookRendererId);
  messageChannel.onDidReceiveMessage((e) => {
    if (e.message.action === "saveFile") {
      saveFile(e.message.payload.data, e.message.payload.type);
    }
  });

  /* add. providers */

  if (settings.extensionConfig().codeCompletion.enable as boolean) {
    context.subscriptions.push(languages.registerCompletionItemProvider(
      [settings.languageId],
      new DotCompletionItemProvider(),
      "=",
      "[",
      "{",
      ":",
    ));
  }

  context.subscriptions.push(languages.registerColorProvider(
    [settings.languageId],
    new ColorProvider(),
  ));

  context.subscriptions.push(languages.registerHoverProvider(
    [settings.languageId],
    new DotHoverProvider(),
  ));

  const symProvider = new SymbolProvider();
  context.subscriptions.push(languages.registerDocumentSymbolProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(languages.registerRenameProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(languages.registerReferenceProvider(
    [settings.languageId],
    symProvider,
  ));
}

/* exports */
exports.activate = onActivate;
