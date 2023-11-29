[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# Graphviz Interactive Preview (Visual Studio Code Extension)

A VSCode extension that provides syntax highlighting, snippets, and an interactive, zoom-, pan- and searchable, live preview with edge tracing for graphs in Graphviz / dot format.

![graphviz_v01](https://user-images.githubusercontent.com/2865694/151164049-9c89e167-d0c1-43eb-ae96-0f5004847bde.gif)

## Language Features

* Graphviz/Dot Language Support / Syntax Highlighting and Snippets (thanks [@joaompinto](https://github.com/joaompinto))
* AutoCompletion
* Rename Symbols
* Find References of node IDs
* Color selection via Color decoration
* Hover information for settings
* Shows syntax errors (only available when the preview of the document is active)

<img width="472" alt="image" src="https://user-images.githubusercontent.com/2865694/163130099-30227a10-e471-4fe0-9564-1d3338f09726.png">
<img width="303" alt="image" src="https://user-images.githubusercontent.com/27259/161251962-6aa3792c-70da-4f48-a9fa-5933012fede2.png">
<img width="576" alt="image" src="https://user-images.githubusercontent.com/2865694/163143275-05f0547b-ce69-43ce-af66-ed76b1f7aa88.png">


## Interactivity Features
* Renders dot/Graphviz sources in an interactive live preview.
* Updates preview as you type.
* Search for nodes in the graph.
* Export the graph as `svg` or `dot`.
* Interactive edge tracing. Click on a node to highlight incoming and outgoing edges (`ESC` to unselect). The Direction of the highlighting can be changed (options: single, upstream, downstream, bidirectional)
* Configurable render engine, render options & tracing preference: e.g. `transitionDelay`, `transitionDuration`.


![graphviz_v01_open](https://user-images.githubusercontent.com/2865694/151163938-f667acf2-bc87-4555-ad93-866a4ca33822.gif)
<img width="576" alt="image" src="https://user-images.githubusercontent.com/27259/161146471-6fb269df-5e3a-4f71-ab6e-37391b33c09c.png">


## Other features
* Available on [github.dev](https://github.dev), [vscode.dev](https://vscode.dev)
* Developers: you can pass a callback function that receives the webPanel when executing the preview command. This allows you to override functionality that is provided by the webPanel, like handlers for click/dblClick events. 

## How to preview

Open a Graphviz/Dot file in the active editor and use either of the following methods to render the preview:

* (a) open the command prompt (<kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>p</kbd>) and type  `> graphviz preview`
* (b) click the <img width="35" alt="image" src="https://user-images.githubusercontent.com/2865694/155575822-720a76d0-68a8-481f-92b4-752d8c6e6242.png"> button in the editor title
* (c) from the editor window's context menu, select `Preview Graphviz / Dot (beside)`

<img width="200" alt="image" src="https://user-images.githubusercontent.com/2865694/154029863-7d7dd582-2b9a-480c-b0de-bcccb9136ae4.png">
<img width="400" alt="image" src="https://user-images.githubusercontent.com/2865694/155575303-8c429902-5599-47cf-855f-c9694a32b829.png">


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

* Create one or multiple new panels displaying the rendered dot graph. Provide the `document` or `uri` object reference of the source code you want to render. Alternatively, you can also provide a `document` or `uri` reference of a virtual document and provide the graphviz dot source with the `content` field. In this case the extension will render the `content` and use the virtual document to extract the path information. The callback function receives the newly created [webPanel](https://github.com/tintinweb/vscode-interactive-graphviz/blob/be9c496/src/features/interactiveWebview.js#L312-L328). Overload `webPanel.handleMessage((message)` from your callback function to receive message events like `onClick` and `onDblClick` emitted from inside the dot render window. 


```javascript
let options = {
    document: <vscode.document>,
    uri: <vscode.uri>,
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
* webview handling: [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/)
* dot language support, syntax highlighting, snippets: taken from [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/) with permission from the author [@joaompinto](https://github.com/joaompinto)

Copyright (c) Microsoft Corporation:
* icons: [vscode-codicons](https://github.com/microsoft/vscode-codicons)
* UI: [vscode-webview-ui-toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit)

## Release Notes

see [CHANGELOG](./CHANGELOG.md)


-----------------------------------------------------------------------------------------------------------
