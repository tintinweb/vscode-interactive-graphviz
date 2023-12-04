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
import { time } from "console";
import { TIMEOUT } from "dns";
import { endsWith } from "lodash";

let previousActiveUri: string | null = null;
let isGraphViewActive = false;
let dotFileUri: string | null = null;
let lastProcessedDocUri: string | null = null;
let openDotFiles = new Set<string>();

function onActivate(context: vscode.ExtensionContext) {
  const graphvizView = new InteractiveWebviewGenerator(context);

  /* Document Events */

  vscode.workspace.onDidChangeTextDocument((event) => {
    console.log("onDidChangeTextDocument");
    if (event.document.languageId === settings.languageId
      || event.document.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
      const panel = graphvizView.getPanel(event.document.uri);
      if (panel) {
        panel.requestRender(event.document.getText());
      }
    }
  }, null, context.subscriptions);

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
    console.log("onDidSaveTextDocument");
    // if (doc.languageId === settings.languageId
    //   || doc.fileName.trim().toLowerCase().endsWith(settings.fileExtension)) {
    //   const panel = graphvizView.getPanel(doc.uri);
    //   if (panel) {
    //     panel.requestRender(doc.getText());
    //   }
    // }
  }));

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (doc) => {
      let isAlreadyOpen = false;

      console.log("onDidOpenTextDocument");
      dotFileUri = doc.uri.toString();
      console.log(dotFileUri)
      // if (doc.uri.path.endsWith('.git')) {
      //   const timeout = 1000;
      //   setTimeout(() => {
      //     vscode.window.tabGroups.activeTabGroup.tabs.forEach(tab => {
      //       if (tab.label.endsWith('.git')) {
      //         vscode.window.tabGroups.close(tab);
      //       }
      //     })
      //   }, timeout);
      // }

      //const filePath = doc.uri.fsPath.replace(/\.git$/, ''); // Normalize file path
      if (doc.uri.toString() == lastProcessedDocUri) {
        return;
      }

      const filePath = doc.uri.fsPath; // Normalize file path
      console.log("filePath: ", filePath);
      if (filePath.endsWith('.dot.git')) {
        console.log("-------------- this is a dot file: ", filePath);
        vscode.languages.setTextDocumentLanguage(doc, 'dot');
        //const isAlreadyOpen = openDotFiles.has(filePath);


        vscode.window.tabGroups.activeTabGroup.tabs.forEach(tab => {
          if (doc.fileName == tab.label) {

            isAlreadyOpen = true;
            return;
          }
        })

        if (!isAlreadyOpen) {
          console.log(`Opened new document: ${filePath}`);
          openDotFiles.add(filePath);
          handleDotDocument(doc);
        }

        if (isAlreadyOpen) {
          vscode.languages.setTextDocumentLanguage(doc, 'dot');
          // Focus on the newly opened or switched .dot document
          await vscode.window.showTextDocument(doc, { preview: false });
          console.log(`Focused on new or switched document: ${filePath}`);
        }
        lastProcessedDocUri = doc.uri.toString();

        console.log("Opened file:", doc.uri.fsPath);
        console.log("Current openDotFiles:", Array.from(openDotFiles));
      }



    })
  );

  function handleDotDocument(doc: vscode.TextDocument) {
    // if (doc.languageId !== settings.languageId || !settings.extensionConfig().get("openAutomatically")) {
    //   return;
    // }
    vscode.languages.setTextDocumentLanguage(doc, 'dot');
    vscode.commands.executeCommand("graphviz-interactive-preview.preview.beside", { document: doc });
  }

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      console.log("onDidCloseTextDocument");


      const baseFilePath = doc.uri.fsPath.replace(/\.git$/, ''); // Remove .git extension if present
      // const baseFilePath = doc.uri.fsPath; // Remove .git extension if present
      if (baseFilePath.endsWith('.dot')) {
        openDotFiles.delete(baseFilePath); // Remove base file path
        if (doc.uri.toString() == dotFileUri) {
          isGraphViewActive = false;
          vscode.commands.executeCommand('setContext', 'isGraphvizInteractivePreviewActive', false);
        }
        console.log("Closed file:", doc.uri.fsPath);
        console.log("Updated openDotFiles:", Array.from(openDotFiles));
      }
      setTimeout(() => {
        vscode.window.tabGroups.activeTabGroup.tabs.forEach(tab => {
          if (tab.label.endsWith('.git')) {
            vscode.window.tabGroups.close(tab);
          }
        })
      },);
    }
    ));
  /* commands */
  context.subscriptions.push(
    vscode.commands.registerCommand("graphviz-interactive-preview.preview.beside", async (a) => {
      console.log("preview.beside command triggered");
      console.log("isGraphViewActive: " + isGraphViewActive);

      const args = a || {};
      const documentToPreview = a?.document ?? vscode.window.activeTextEditor?.document;

      if (isGraphViewActive) {

        console.log("Switching from graph view to .dot file view");
        if (dotFileUri) {
          await vscode.window.showTextDocument(vscode.Uri.parse(dotFileUri), { preview: false });
        }
        isGraphViewActive = false;

        vscode.commands.executeCommand('setContext', 'isGraphvizInteractivePreviewActive', false);
        return;
      }

      // Logic for switching from .dot file view to graph view
      console.log("Switching to graph view");
      console.log("ACTIVE EDITOR: " + vscode.window.activeTextEditor)
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showInformationMessage("No active DOT file editor.");
        return;
      }

      // Save the current DOT file Uri and activate the graph view
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
            webpanel.waitingForRendering = o.content;
            webpanel.search = o.search;
            if (o.callback) {
              o.callback(webpanel);
            }
          });
      };




      vscode.window.tabGroups.activeTabGroup.tabs.forEach(tab => {
        if (tab.label == options.document.label) {
          return;
        }
      })

      if (!options.content && options.document) {
        options.content = options.document.getText();
      }

      if (!options.content && options.uri) {
        vscode.workspace.fs.readFile(options.uri)
          .then((data) => {
            const td = new TextDecoder();
            options.content = td.decode(data);
            console.log("Options.document.label: ", Array.from(options.content));
            execute(options);
          });
      } else if (options.content) {
        console.log("Options.content: ", Array.from(options.content));
        execute(options);
      } else {
        vscode.window.showErrorMessage("No content for previewing!");
      }
      lastProcessedDocUri = options.uri.toString();
    }
    )
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