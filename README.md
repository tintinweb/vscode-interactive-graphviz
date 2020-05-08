[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# vscode-interactive-graphviz
Interactive Graphviz Dot Preview for Visual Studio Code

![vscode-graphviz-interactive](https://user-images.githubusercontent.com/2865694/57646539-18fecb00-75c1-11e9-9042-52dccc522bba.gif)
![vscode-graphviz-interactive-cmd](https://user-images.githubusercontent.com/2865694/57646538-17cd9e00-75c1-11e9-8aee-08c13394a32c.gif)


* Preview dot/Graphviz source.
* Updates preview as you type.
* Interactive edge tracking. click on a node to highlight incoming and outgoing edges.
* Export the graph as `svg` or `dot`.
* Configurable graph options: e.g. `transitionDelay`, `transitionDuration`.
* Developers: you can pass a callback function that receives the webPanel when executing the preview command. This allows you to override functionality that is provided by the webPanel like handlers for click/dblClick events.


## Developer Notes

**Note**:❗v0.0.8 introduced a breaking change: the render command was renamed from `interactive-graphviz.preview.beside` to `graphviz-interactive-preview.preview.beside`

### Interact with this extension

* add `graphviz-interactive-preview` to your `package.json` extension dependencies.
  
```json
{
    "name": "your-extension",
    "extensionDependencies": ["tintinweb.graphviz-interactive-preview"],
}
```

* Create a new panel displaying the rendered dot graph. Either provide a document or both the document and the graphviz dot source. The callback function receives the newly created [webPanel](https://github.com/tintinweb/vscode-interactive-graphviz/blob/be9c496/src/features/interactiveWebview.js#L312-L328). Overload `webPanel.handleMessage((message)` from your callback function to receive message events like `onClick` and `onDblClick` emitted from inside the dot render window. 


```javascript
let args = {
    document: <vscode.document>,
    content: <string:dotSrc>,
    callback: <function (webpanel){}>
}
            
vscode.commands.executeCommand("graphviz-interactive-preview.preview.beside", args)
```

## Credits

* graph engine: [d3-graphviz](https://github.com/magjac/d3-graphviz)
* edge tracking: [jquery.graphviz.svg](https://github.com/mountainstorm/jquery.graphviz.svg/)
* webview handling: [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/)

## Release Notes

see [CHANGELOG](./CHANGELOG.md)


-----------------------------------------------------------------------------------------------------------
