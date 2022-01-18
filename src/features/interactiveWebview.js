'use strict';
/**
 * @author github.com/tintinweb
 * @license MIT
 *
* */


/** imports */
const vscode = require("vscode");
const path =  require("path");
const fs = require("fs");

const PreviewPanel = require("./previewPanel");

/** global vars */


/** classdecs */

class InteractiveWebviewGenerator {

    constructor(context, content_folder) {
        this.context = context;
        this.webviewPanels = new Map();
        this.timeout = null;
        this.content_folder = content_folder;
        this.search = null;
    }

    setNeedsRebuild(uri, needsRebuild) {
        let panel = this.webviewPanels.get(uri);

        if (panel) {
            panel.setNeedsRebuild(needsRebuild);
            this.rebuild();
        }
    }

    getPanel(uri){
        return this.webviewPanels.get(uri);
    }

    dispose() {
    }

    rebuild() {
        this.webviewPanels.forEach(panel => {
            if(panel.getNeedsRebuild() && panel.getPanel().visible) {
                this.updateContent(panel, vscode.workspace.textDocuments.find(doc => doc.uri == panel.uri));
            }
        });
    }

    async revealOrCreatePreview(displayColumn, doc, options) {
        let that = this;
        
        return new Promise(function(resolve, reject) {
            let previewPanel = that.webviewPanels.get(doc.uri);

            if (previewPanel && !options.allowMultiplePanels) {
                previewPanel.reveal(displayColumn);
            }
            else {
                previewPanel = that.createPreviewPanel(doc, displayColumn, options.title);
                that.webviewPanels.set(doc.uri, previewPanel);
                // when the user closes the tab, remove the panel
                previewPanel.getPanel().onDidDispose(() => that.webviewPanels.delete(doc.uri), undefined, that.context.subscriptions);
                // when the pane becomes visible again, refresh it
                previewPanel.getPanel().onDidChangeViewState(_ => that.rebuild());

                previewPanel.getPanel().webview.onDidReceiveMessage(e => that.handleMessage(previewPanel, e), undefined, that.context.subscriptions);
            }

            that.updateContent(previewPanel, doc)
                .then(previewPanel => {
                    resolve(previewPanel);
                });
        });
    }

    handleMessage(previewPanel, message) {
        console.log(`Message received from the webview: ${message.command}`);

        switch(message.command){
            case 'onRenderFinished':
                previewPanel.onRenderFinished(message.value.err);
                break;
            case 'onPageLoaded':
                previewPanel.onPageLoaded();
                break;
            case 'message':
                if(message.value.type === "error") {
                    vscode.window.showErrorMessage(message.value.data);
                } else {
                    vscode.window.showInformationMessage(message.value.data);
                }
                break;
            case 'onClick':
                // not implemented
                //console.debug(message);
                previewPanel.handleMessage(message);  //just forward the event for now
                break;
            case 'onDblClick':
                // not implemented
                //console.log("dblclick --> navigate to code location");
                previewPanel.handleMessage(message);  //just forward the event for now
                break;
            case 'saveAs':
                let filter;

                if(message.value.type=="dot"){
                    filter = {'Graphviz Dot Files':['dot']};
                } else if(message.value.type=="svg"){
                    filter = {'Images':['svg']};
                } else {
                    return;
                }
                vscode.window.showSaveDialog({
                    saveLabel:"export",
                    filters: filter
                })
                .then((fileUri) => {
                    if(fileUri){
                        fs.writeFile(fileUri.fsPath, message.value.data, function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            previewPanel.panel.webview.postMessage({ command: 'saveSvgSuccess' });
                            console.log("File Saved");
                        });
                    }
                });
                break;
            default:
                previewPanel.handleMessage(message);
                //forward unhandled messages to previewpanel
        }
    }

    createPreviewPanel(doc, displayColumn, title) {
        let previewTitle = title || `Preview: '${path.basename(doc.fileName)}'`;

        let webViewPanel = vscode.window.createWebviewPanel('graphvizPreview', previewTitle, displayColumn, {
            enableFindWidget: false,
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, "content"))
            ]
        });

        webViewPanel.iconPath = vscode.Uri.file(this.context.asAbsolutePath(path.join("content","icon.png")));

        return new PreviewPanel(this, doc.uri, webViewPanel);
    }

    async updateContent(previewPanel, doc) {
        return new Promise(async (resolve, reject) => {
            if(!previewPanel.getPanel().webview.html) {
                previewPanel.getPanel().webview.html = "Please wait...";
            }
            previewPanel.setNeedsRebuild(false);
            previewPanel.getPanel().webview.html = await this.getPreviewHtml(previewPanel, doc);
            return resolve(previewPanel);
        });
    }

    async getPreviewTemplate(context, templateName){
        let previewPath = context.asAbsolutePath(path.join(this.content_folder, templateName));

        return new Promise((resolve, reject) => {
            fs.readFile(previewPath, "utf8", function (err, data) {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    async getPreviewHtml(previewPanel, doc){
        let templateHtml = await this.getPreviewTemplate(this.context, "index.html");

        templateHtml = templateHtml.replace(/<script(.*)src="(.+)">/g, (scriptTag, middle, srcPath) => {
            let resource=vscode.Uri.file(
                path.join(this.context.extensionPath, this.content_folder, ...(srcPath.split("/"))));
            return `<script${middle}src="${previewPanel.getPanel().webview.asWebviewUri(resource)}">`;
        }).replace(/<link rel="stylesheet" href="(.+)" \/>/g, (scriptTag, srcPath) => {
            let resource=vscode.Uri.file(
                path.join(this.context.extensionPath, this.content_folder, ...(srcPath.split("/"))));
            return `<link rel="stylesheet" href="${previewPanel.getPanel().webview.asWebviewUri(resource)}" />`;
        });
        return templateHtml;
    }
}



module.exports = {
    InteractiveWebviewGenerator:InteractiveWebviewGenerator
};
