[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# vscode-interactive-graphviz

A VSCode extension that provides syntax highlighting, snippets, and an interactive, zoom-, pan- and searchable, live preview with edge tracing for graphs in Graphviz / dot format.


![graphviz_v01](https://user-images.githubusercontent.com/2865694/151164049-9c89e167-d0c1-43eb-ae96-0f5004847bde.gif)

![graphviz_v01_open](https://user-images.githubusercontent.com/2865694/151163938-f667acf2-bc87-4555-ad93-866a4ca33822.gif)

* Graphviz/Dot Language Support / Syntax Highlighting and Snippets (thanks [@joaompinto](https://github.com/joaompinto))
* Renders dot/Graphviz sources in an interactive live preview.
* Updates preview as you type.
* Interactive edge tracing. Click on a node to highlight incoming and outgoing edges (`ESC` to unselect).
* Search for nodes in the graph.
* Export the graph as `svg` or `dot`.
* Configurable render options & tracing preference: e.g. `transitionDelay`, `transitionDuration`.
* Available on [github.dev](https://github.dev), [vscode.dev](https://vscode.dev)
* Developers: you can pass a callback function that receives the webPanel when executing the preview command. This allows you to override functionality that is provided by the webPanel, like handlers for click/dblClick events. 

## Render Examples

<a href="https://user-images.githubusercontent.com/2865694/151163516-fbb956ab-607c-45dc-8c83-db3477ceccf9.png"><img width="250" alt="semantic-arg-dark" src="https://user-images.githubusercontent.com/2865694/151163516-fbb956ab-607c-45dc-8c83-db3477ceccf9.png" ></a>
<a href="https://user-images.githubusercontent.com/2865694/151163623-8714f717-a4ed-428c-bd87-213c8035892d.png"><img width="250" alt="semantic-arg-dark" src="https://user-images.githubusercontent.com/2865694/151163623-8714f717-a4ed-428c-bd87-213c8035892d.png" ></a>
<a href="https://user-images.githubusercontent.com/2865694/151163732-0a0113c6-7328-4345-b71a-7df782aa0387.png"><img width="250" alt="semantic-arg-dark" src="https://user-images.githubusercontent.com/2865694/151163732-0a0113c6-7328-4345-b71a-7df782aa0387.png" ></a>
<a href="https://user-images.githubusercontent.com/2865694/151163840-ceb6d75e-983d-4126-9169-6431d1dbfe1d.png"><img width="250" alt="semantic-arg-dark" src="https://user-images.githubusercontent.com/2865694/151163840-ceb6d75e-983d-4126-9169-6431d1dbfe1d.png" ></a>


## Developer Notes

**Note**:❗v0.0.8 introduced a breaking change: the render command was renamed from `interactive-graphviz.preview.beside` to `graphviz-interactive-preview.preview.beside`

The extension can be set run on development machines with
```
npm run watch
```

In order to test the extension as a web extension you have to start
```
npm run open-in-browser
```

### Interact with this extension

* add `graphviz-interactive-preview` to your `package.json` extension dependencies.
  
```json
{
    "name": "your-extension",
    "extensionDependencies": ["tintinweb.graphviz-interactive-preview"],
}
```

* Create one or multiple new panels displaying the rendered dot graph. Either provide a document or both the document and the graphviz dot source. The callback function receives the newly created [webPanel](https://github.com/tintinweb/vscode-interactive-graphviz/blob/be9c496/src/features/interactiveWebview.js#L312-L328). Overload `webPanel.handleMessage((message)` from your callback function to receive message events like `onClick` and `onDblClick` emitted from inside the dot render window. 


```javascript
let options = {
    document: <vscode.document>,
    content: <string: dotSrc>,
    callback: <function(webpanel){}>,
    allowMultiplePanels: <bool: false|[true]>,
    title: <string: RenderWindowTitle>,
    search: <optional string: Search | object: searchOptions>
}
            
vscode.commands.executeCommand("graphviz-interactive-preview.preview.beside", options)
```

Please do not hesitate to reach out if you are missing specific functionality.

## Maintainers

* [@tintinweb](https://github.com/tintinweb)
* [@bigbug](https://github.com/bigbug)

see [AUTHORS](AUTHORS) for a list contributors.

## Credits

* graph engine: [d3-graphviz](https://github.com/magjac/d3-graphviz)
* edge tracking: [jquery.graphviz.svg](https://github.com/mountainstorm/jquery.graphviz.svg/)
* webview handling: [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/)
* dot language support, syntax highlighting, snippets: taken from [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/) with permission from the author [@joaompinto](https://github.com/joaompinto)

Copyright (c) Microsoft Corporation:
* icons: [vscode-codicons](https://github.com/microsoft/vscode-codicons)
* UI: [vscode-webview-ui-toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit)

## Release Notes

see [CHANGELOG](./CHANGELOG.md)


-----------------------------------------------------------------------------------------------------------
