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
import ColorProvider from "./language/ColorProvider";
import DotCompletionItemProvider from "./language/CompletionItemProvider";
import DotDocumentFormatter from "./language/DocumentFormatter";
import DotHoverProvider from "./language/HoverProvider";
import SymbolProvider from "./language/SymbolProvider";
import * as settings from "./settings";

let previousActiveUri: string | null = null;
let isGraphViewActive = false;
let dotFileUri: string | null = null;
let lastProcessedDocUri: string | null = null;
let isProgrammaticOpen = false;

function removeGitAndAfter(str: string | null) {
  if (!str) {
    return str;
  }
  const gitIndex = str.indexOf('.git');
  if (gitIndex !== -1) {
    return str.substring(0, gitIndex);
  }
  return str;
}

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
      if (isProgrammaticOpen) {
        return;
      }
      console.log("------------------------------------------------------------------")
      if (removeGitAndAfter(doc.uri.toString()) === removeGitAndAfter(lastProcessedDocUri)) {
        console.log("AVOIDED OPENING SAME DOC TWICE")
        // Avoid processing the same document again immediately
        return;
      }
      console.log("Opened document: " + removeGitAndAfter(doc.uri.toString()));
      console.log(doc.uri.path);
      console.log("Last Open: " + removeGitAndAfter(lastProcessedDocUri))

      lastProcessedDocUri = removeGitAndAfter(doc.uri.toString());

      if (doc.uri.path.endsWith('.dot.git')) {
        // Change the language ID to 'dot' for files ending with '.dot.git'
        vscode.languages.setTextDocumentLanguage(doc, 'dot').then((updatedDoc) => {
          console.log("Changed language ID to 'dot' for file ending with '.dot.git'")
          console.log(doc.uri.path);
          // Additional logic after setting the language
          handleDotDocument(updatedDoc);
        });
      } else {
        // Handle regular dot documents
        handleDotDocument(doc);
        console.log("No changed language ID to 'dot' for file ending with '.dot.git'")
        console.log(doc.uri.path);
      }
    })
  );

  function handleDotDocument(doc: vscode.TextDocument) {
    if (doc.languageId !== settings.languageId || !settings.extensionConfig().get("openAutomatically")) {
      return;
    }
    isProgrammaticOpen = true;
    vscode.commands.executeCommand("graphviz-interactive-preview.preview.beside", { document: doc });
    isProgrammaticOpen = false;
  }

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      if (doc.uri.toString() === dotFileUri) {
        isGraphViewActive = false;
        vscode.commands.executeCommand('setContext', 'isGraphvizInteractivePreviewActive', false);

        lastProcessedDocUri = null;
      }
    }
    ));
  /* commands */
  context.subscriptions.push(
    vscode.commands.registerCommand("graphviz-interactive-preview.preview.beside", async (a) => {

      isProgrammaticOpen = false;
      // Implement the logic to render the preview of the DOT file
      // and open it in the current tab. This might involve creating a temporary file
      // or using a webview, depending on how your rendering logic works.
      const execute = (o: any) => {

        graphvizView.revealOrCreatePreview(
          o.displayColumn,
          o.uri,
          o,
        )
          .then((webpanel: PreviewPanel) => {
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
      const args = a || {};
      // isProgrammaticOpen = true;
      if (isGraphViewActive) {
        // Logic to revert back to the DOT file
        vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        if (dotFileUri) {
          vscode.window.showTextDocument(vscode.Uri.parse(dotFileUri), { preview: false });

          lastProcessedDocUri = removeGitAndAfter(dotFileUri.toString());
        }
        isGraphViewActive = false;
        vscode.commands.executeCommand('setContext', 'isGraphvizInteractivePreviewActive', false);

        // const activeEditor = vscode.window.activeTextEditor;
        // if (!activeEditor) {
        //   vscode.window.showInformationMessage("No active DOT file editor.");
        //   return;
        // }
        // lastProcessedDocUri = activeEditor.document.uri.toString();
      } else {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showInformationMessage("No active DOT file editor.");
          return;
        }

        // const dotEditors = vscode.window.visibleTextEditors.filter(editor => editor.document.languageId === 'dot');
        // if (dotEditors.length === 0) {
        //   vscode.window.showInformationMessage("No open DOT file editor.");
        //   return;
        // }
        // const activeEditor = dotEditors[0];
        // Save the current DOT file Uri and open the graph view
        dotFileUri = activeEditor.document.uri.toString();
        isGraphViewActive = true;
        vscode.commands.executeCommand('setContext', 'isGraphvizInteractivePreviewActive', true);

        // Define options for opening the preview
        const options = {
          document: args.document || activeEditor.document,
          uri: args.uri || activeEditor.document.uri,
          content: args.content,
          callback: args.callback,
          allowMultiplePanels: args.allowMultiplePanels || false,
          title: args.title,
          search: args.search,
          displayColumn: args.displayColumn || {
            viewColumn: vscode.ViewColumn.Active,
            preserveFocus: settings.extensionConfig().get("preserveFocus"),
          },
        };



        if (!options.content && options.document) {
          options.content = options.document.getText();
        }

        if (!options.content && options.uri) {
          vscode.workspace.fs.readFile(options.uri)
            .then((data) => {
              const td = new TextDecoder();
              options.content = td.decode(data);
              execute(options);
            });
        } else if (options.content) {
          execute(options);
        } else {
          vscode.window.showErrorMessage("No content for previewing!");
        }

      }
    })
  );


  /* add. providers */

  if (settings.extensionConfig().codeCompletion.enable as boolean) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
      [settings.languageId],
      new DotCompletionItemProvider(context),
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