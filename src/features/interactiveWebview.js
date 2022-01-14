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

/** global vars */


/** classdecs */

class InteractiveWebviewGenerator {

    constructor(context, content_folder) {
        this.context = context;
        this.webviewPanels = new Map();
        this.timeout = null;
        this.content_folder = content_folder;
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
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "content"))]
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
        }).replace(/<link rel="stylesheet" href="(.+)"\/>/g, (scriptTag, srcPath) => {
            let resource=vscode.Uri.file(
                path.join(this.context.extensionPath, this.content_folder, ...(srcPath.split("/"))));
            return `<link rel="stylesheet" href="${previewPanel.getPanel().webview.asWebviewUri(resource)}"/>`;
        });
        return templateHtml;
    }
}

class PreviewPanel {

    constructor( parent, uri,  panel) {
        this.parent = parent;
        this.needsRebuild = false;
        this.uri = uri;
        this.panel = panel;

        this.lockRender = false;
        this.lastRender = Date.now();
        this.lastRequest = Date.now();
        this.waitingForRendering = null;
        this.timeoutForWaiting = null;
        this.timeoutForRendering = null;
        this.enableRenderLock = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("renderLock");
        this.renderInterval = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("renderInterval");
        this.debouncingInterval = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("debouncingInterval");
        this.guardInterval = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("guardInterval");

        let renderLockAdditionalTimeout = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("renderLockAdditionalTimeout");
        let view_transitionDelay = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("view.transitionDelay");
        let view_transitionaDuration = vscode.workspace.getConfiguration('graphviz-interactive-preview').get("view.transitionDuration");
        this.renderLockTimeout =
            (this.enableRenderLock && renderLockAdditionalTimeout >= 0) ?
            renderLockAdditionalTimeout + view_transitionDelay + view_transitionaDuration :
            0;
    }

    reveal(displayColumn) {
        this.panel.reveal(displayColumn);
    }

    setNeedsRebuild(needsRebuild) {
        this.needsRebuild = needsRebuild;
    }

    getNeedsRebuild() {
        return this.needsRebuild;
    }

    getPanel() {
        return this.panel;
    }

    // the following functions do not use any locking/synchronization mechanisms, so it may behave weirdly in edge cases

    requestRender(dotSrc) {
        let now = Date.now();
        let sinceLastRequest = now - this.lastRequest;
        let sinceLastRender = now - this.lastRender;
        this.lastRequest = now;

        // save the latest content
        this.waitingForRendering = dotSrc;

        // hardcoded:
        // why: to filter out double-events on-save on-change etc, while preserving the ability to monitor fast-changing files etc.
        // what: it delays first render after a period of inactivity (this.guardInterval) has passed
        // how: this is effectively an anti-debounce, it will only pass-through events that come fast enough after the last one,
        //      and delays all others
        let waitFilterFirst = this.guardInterval < sinceLastRequest ? this.guardInterval : 0;
        // will be >0 if there if debouncing is enabled
        let waitDebounce = this.debouncingInterval;
        // will be >0 if there is need to wait bcs. of inter-renderding interval settings
        let waitRenderInterval = this.renderInterval - sinceLastRender;

        let waitBeforeRendering = Math.max(waitFilterFirst, waitDebounce, waitRenderInterval);

        // schedule the last blocked request after the current rendering is finished or when the interval elapses
        if(waitBeforeRendering > 0) {
            // schedule a timeout to render that content later
            // if timeout is already set, we might need to reset it,
            // because we are sharing one timeout for
            // 1) debouncing (**needs** to be delayed everytime),
            // 2) inter-rednering (does not need to be delayed)
            if (waitDebounce > 0 || !this.timeoutForWaiting) {
                clearTimeout(this.timeoutForWaiting);
                this.timeoutForWaiting = setTimeout(
                    () => this.renderWaitingContent(),
                    waitBeforeRendering
                    );
            }
            // scheduled, now return
            console.log("requestRender() scheduling bcs interval, wait: " + waitBeforeRendering);
            return;
        }

        console.log("requestRender() calling renderWaitingContent");
        this.renderWaitingContent();
    }

    renderWaitingContent() {
        // clear the timeout and null it's handle, we are rendering any waiting content now!
        if (!!this.timeoutForWaiting) {
            console.log("renderWaitingContent() clearing existing timeout");
            clearTimeout(this.timeoutForWaiting);
            this.timeoutForWaiting = null;
        }

        if (this.waitingForRendering) {
            // if lock-on-active-rendering is enabled, and it is "locked", return and wait to be called from onRenderFinished
            if(this.enableRenderLock && this.lockRender) {
                console.log("renderWaitingContent() with content, now is locked");
                return;
            }
            let dotSrc = this.waitingForRendering;
            this.waitingForRendering = null;
            console.log("renderWaitingContent() with content, calling renderNow");
            this.renderNow(dotSrc);
        }
        else console.log("renderWaitingContent() no content");
    }

    renderNow(dotSrc){
        console.log("renderNow()");
        this.lockRender = true;
        this.lastRender = Date.now();
        if (this.renderLockTimeout > 0)
        {
            this.timeoutForRendering = setTimeout(
                () => {console.log("unlocking rendering bcs. of timeout"); this.onRenderFinished();},
                this.renderLockTimeout
                );
        }
        this.panel.webview.postMessage({ command: 'renderDot', value: dotSrc });
    }

    handleMessage(message){
        /** 
         * Dev: handle messages emitted by the graphviz view
         */
        switch(message.command){
            /*
            case 'onClick':
               //do something
                break;
            case 'onDblClick':
                //do something
                break;
            */
            default:
                console.warn('Unexpected command: ' + JSON.stringify(message));
        }
    }

    onRenderFinished(err){
        if (err)
            console.log("rendering failed: " + err);

        if (!!this.timeoutForRendering) {
            clearTimeout(this.timeoutForRendering);
            this.timeoutForRendering = null;
        }
        this.lockRender = false;
        this.renderWaitingContent();
    }

    onPageLoaded(){
        this.panel.webview.postMessage({
            command: 'setConfig',
            value : {
                transitionDelay : vscode.workspace.getConfiguration('graphviz-interactive-preview').get("view.transitionDelay"),
                transitionaDuration : vscode.workspace.getConfiguration('graphviz-interactive-preview').get("view.transitionDuration")
            }
        });
        this.renderWaitingContent();
    }
}


module.exports = {
    InteractiveWebviewGenerator:InteractiveWebviewGenerator
};
