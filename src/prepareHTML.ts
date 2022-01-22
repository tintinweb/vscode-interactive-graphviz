import * as vscode from 'vscode';
import { Utils } from 'vscode-uri';

export default function prepareHTML(
  originalHTML: string,
  context: vscode.ExtensionContext,
  path: string,
  webviewPanel: vscode.WebviewPanel,
): string {
  // Get data from file
  let templateHtml = originalHTML;

  const resource = Utils.joinPath(context.extensionUri, 'content');
  const contentURI = webviewPanel.webview.asWebviewUri(resource);
  console.log(contentURI);

  // Replace script and link tag resources with extension's path
  templateHtml = templateHtml
    .replace(
      /<script(.*)src="(.+)">/g,
      (scriptTag: any, middle: any, srcPath: string) => `<script${middle}src="${contentURI}/${srcPath}">`,
    )
    .replace(
      /<link rel="stylesheet" href="(.+)" \/>/g,
      (scriptTag: any, srcPath: string) => {
        const resource = Utils.joinPath(
          context.extensionUri,
          path,
          ...srcPath.split('/'),
        );
        return `<link rel="stylesheet" href="${webviewPanel.webview.asWebviewUri(
          resource,
        )}" />`;
      },
    );

  return templateHtml;
}
