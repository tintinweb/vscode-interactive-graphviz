/**
 * @author github.com/tintinweb
 * @license GPLv3
 *
* */

/** imports */
import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';
import { TextEncoder } from 'text-encoding';
import PreviewPanel from './previewPanel';
import prepareHTML from '../prepareHTML';

const webviewPanelContent = require('../../content/index.html').default;

/** global vars */

/** classdecs */

export default class InteractiveWebviewGenerator {
  private context: vscode.ExtensionContext;

  private webviewPanels: Map<vscode.Uri, PreviewPanel>;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.webviewPanels = new Map();
  }

  setNeedsRebuild(uri: vscode.Uri, needsRebuild: boolean) {
    const panel = this.webviewPanels.get(uri);

    if (panel) {
      panel.setNeedsRebuild(needsRebuild);
      this.rebuild();
    }
  }

  getPanel(uri: vscode.Uri) {
    return this.webviewPanels.get(uri);
  }

  dispose() {
  }

  rebuild() {
    this.webviewPanels.forEach((panel) => {
      if (panel.getNeedsRebuild() && panel.getPanel().visible) {
        const findTextDocument = vscode.workspace.textDocuments.find((doc) => doc.uri == panel.uri);
        if (!findTextDocument) return;
        this.updateContent(panel);
      }
    });
  }

  async revealOrCreatePreview(displayColumn: vscode.ViewColumn, doc: vscode.TextDocument, options: { allowMultiplePanels: true; title: string; }) : Promise<PreviewPanel> {
    const that = this;

    return new Promise((resolve, reject) => {
      let previewPanel = that.webviewPanels.get(doc.uri);

      if (previewPanel && !options.allowMultiplePanels) {
        previewPanel.reveal(displayColumn);
      } else {
        previewPanel = that.createPreviewPanel(doc, displayColumn, options.title);

        if (!previewPanel) {
          reject();
          return;
        }
        that.webviewPanels.set(doc.uri, previewPanel);
        // when the user closes the tab, remove the panel
        previewPanel.getPanel().onDidDispose(() => {
          previewPanel?.dispose();
          return that.webviewPanels.delete(doc.uri), undefined, that.context.subscriptions;
        });
        // when the pane becomes visible again, refresh it
        previewPanel.getPanel().onDidChangeViewState((_: any) => that.rebuild());

        previewPanel.getPanel().webview.onDidReceiveMessage((e: any) => that.handleMessage(previewPanel as PreviewPanel, e), undefined, that.context.subscriptions);
      }

      that.updateContent(previewPanel);
      resolve(previewPanel);
    });
  }

  saveFile(data: string, fileType: string) {
    let filter;
    if (fileType === 'dot') {
      filter = { 'Graphviz Dot Files': ['dot'] };
    } else if (fileType === 'svg') {
      filter = { Images: ['svg'] };
    } else {
      vscode.window.showErrorMessage('Unknown file type for saving!');
      return;
    }
    vscode.window.showSaveDialog({
      saveLabel: 'export',
      filters: filter,
    })
      .then((fileUri) => {
        if (fileUri) {
          try {
            const te = new TextEncoder();
            vscode.workspace.fs.writeFile(fileUri, te.encode(data))
              .then(() => {
                console.log('File Saved');
              }, (err : any) => {
                vscode.window.showErrorMessage(`Error on writing file: ${err}`);
              });
          } catch (err) {
            vscode.window.showErrorMessage(`Error on writing file: ${err}`);
          }
        }
      });
  }

  handleMessage(previewPanel: PreviewPanel, message: { command: string; value: { err: any; type: string; data: string; }; }) {
    console.log(`Message received from the webview: ${message.command}`);

    switch (message.command) {
      case 'onRenderFinished':
        previewPanel.onRenderFinished(message.value.err);
        break;
      case 'onPageLoaded':
        previewPanel.onPageLoaded();
        break;
      case 'message':
        if (message.value.type === 'error') {
          vscode.window.showErrorMessage(message.value.data);
        } else {
          vscode.window.showInformationMessage(message.value.data);
        }
        break;
      case 'onClick':
        // not implemented
        // console.debug(message);
        previewPanel.handleMessage(message); // just forward the event for now
        break;
      case 'onDblClick':
        // not implemented
        // console.log("dblclick --> navigate to code location");
        previewPanel.handleMessage(message); // just forward the event for now
        break;
      case 'saveAs':
        this.saveFile(message.value.data, message.value.type);
        break;
      default:
        previewPanel.handleMessage(message);
                // forward unhandled messages to previewpanel
    }
  }

  createPreviewPanel(doc: vscode.TextDocument, displayColumn: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean | undefined; }, title: string) {
    const previewTitle = title || `Preview: '${Utils.basename(doc.uri)}'`;

    const webViewPanel = vscode.window.createWebviewPanel('graphvizPreview', previewTitle, displayColumn, {
      enableFindWidget: false,
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        Utils.joinPath(this.context.extensionUri, 'content'),
      ],
    });

    webViewPanel.iconPath = Utils.joinPath(this.context.extensionUri, 'content', 'icon.png');

    return new PreviewPanel(doc.uri, webViewPanel);
  }

  updateContent(previewPanel: PreviewPanel) : void {
    const webviewPanel: vscode.WebviewPanel = previewPanel.getPanel();
    if (!webviewPanel.webview.html) {
      webviewPanel.webview.html = 'Please wait...';
    }
    previewPanel.setNeedsRebuild(false);
    webviewPanel.webview.html = prepareHTML(webviewPanelContent, this.context, 'content', webviewPanel);
  }
}
