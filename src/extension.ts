/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
  * */

/** imports */
import { TextDecoder } from "text-encoding";
import * as vscode from "vscode";
import InteractiveWebviewGenerator from "./features/interactiveWebview";
import PreviewPanel from "./features/previewPanel";
import saveFile from "./features/saveFile";
import { IMessageSetConfiguration, IRenderCommunication } from "./types/IRenderConfiguration";
import ColorProvider from "./language/ColorProvider";
import DotCompletionItemProvider from "./language/CompletionItemProvider";
import DotDocumentFormatter from "./language/DocumentFormatter";
import DotHoverProvider from "./language/HoverProvider";
import SymbolProvider from "./language/SymbolProvider";
import * as settings from "./settings";

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

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId !== settings.languageId) return;
      if (!settings.extensionConfig().get("openAutomatically")) return;

      vscode.commands.executeCommand("graphviz-interactive-preview.preview.beside", {
        document: doc,
      });
    }),
  );

  /* commands */

  context.subscriptions.push(
    vscode.commands.registerCommand("graphviz-interactive-preview.preview.beside", (a) => {
      // take document or string; default active editor if
      const args = a || {};
      const options : {
        document?: vscode.TextDocument,
        uri?: vscode.Uri,
        content?: string,
        // eslint-disable-next-line no-unused-vars
        callback?: (panel: PreviewPanel) => void,
        allowMultiplePanels?: boolean,
        title?: string,
        search?: any,
        displayColumn?: vscode.ViewColumn | {
          viewColumn: vscode.ViewColumn;
          preserveFocus?: boolean | undefined;
        }
      } = {
        document: args.document,
        uri: args.uri,
        content: args.content,
        callback: args.callback,
        allowMultiplePanels: args.allowMultiplePanels,
        title: args.title,
        search: args.search,
        displayColumn: args.displayColumn || {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: settings.extensionConfig().get("preserveFocus"),
        },
      };

      if (!options.content
        && !options.document
        && !options.uri
        && vscode.window.activeTextEditor?.document) {
        options.document = vscode.window.activeTextEditor.document;
      }

      if (!options.uri && options.document) {
        options.uri = options.document.uri;
      }

      if (typeof options.displayColumn === "object" && options.displayColumn.preserveFocus === undefined) {
        options.displayColumn.preserveFocus = settings.extensionConfig().get("preserveFocus"); // default to user settings
      }

      const execute = (o:any) => {
        graphvizView.revealOrCreatePreview(
          o.displayColumn,
          o.uri,
          o,
        )
          .then((webpanel : PreviewPanel) => {
            // trigger dot render on page load success
            // just in case webpanel takes longer to load, wait for page
            // to ping back and perform action
            // eslint-disable-next-line no-param-reassign
            webpanel.waitingForRendering = o.content;
            // eslint-disable-next-line no-param-reassign
            webpanel.search = o.search;

            // allow caller to handle messages by providing them with the newly created webpanel
            // e.g. caller can override webpanel.handleMessage = function(message){};
            if (o.callback) {
              o.callback(webpanel);
            }
          });
      };

      if (!options.content) {
        if (options.document) {
          options.content = options.document.getText();
        } else if (options.uri) {
          vscode.workspace.fs.readFile(options.uri)
            .then((data) => {
              const td = new TextDecoder();
              options.content = td.decode(data);
              execute(options);
            });
          return;
        } else {
          vscode.window.showErrorMessage("No content for previewing!");
        }
      }
      execute(options);
    }),
  );

  /* notebook messaging */
  const messageChannel: vscode.NotebookRendererMessaging = vscode.notebooks
    .createRendererMessaging(settings.notebookRendererId);
  messageChannel.onDidReceiveMessage((e: {message: IRenderCommunication}) => {
    if (e.message.command === "saveAs") {
      saveFile(e.message.value.data, e.message.value.type);
    }
    if (e.message.command === "ready") {
      const msg : IMessageSetConfiguration = {
        command: "setConfiguration",
        value: {
          transitionDelay: settings.extensionConfig().get("view.transitionDelay"),
          transitionDuration: settings.extensionConfig().get("view.transitionDuration"),
          themeColors: settings.extensionConfig().get("view.themeColors"),
        },
      };
      messageChannel.postMessage(msg as IRenderCommunication);
    }
  });

  /* add. providers */

  if (settings.extensionConfig().codeCompletion.enable as boolean) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
      [settings.languageId],
      new DotCompletionItemProvider(),
      "=",
      "[",
      "{",
      ":",
    ));
  }

  context.subscriptions.push(vscode.languages.registerColorProvider(
    [settings.languageId],
    new ColorProvider(),
  ));

  context.subscriptions.push(vscode.languages.registerHoverProvider(
    [settings.languageId],
    new DotHoverProvider(),
  ));

  const symProvider = new SymbolProvider();
  context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerRenameProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerReferenceProvider(
    [settings.languageId],
    symProvider,
  ));
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
    [settings.languageId],
    new DotDocumentFormatter(),
  ));
}

/* exports */
exports.activate = onActivate;
