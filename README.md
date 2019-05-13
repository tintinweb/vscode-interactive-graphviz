[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# vscode-interactive-graphviz
Interactive Graphviz Dot Preview for Visual Studio Code

![vscode-graphviz-interactive](https://user-images.githubusercontent.com/2865694/57646539-18fecb00-75c1-11e9-9042-52dccc522bba.gif)
![vscode-graphviz-interactive-cmd](https://user-images.githubusercontent.com/2865694/57646538-17cd9e00-75c1-11e9-8aee-08c13394a32c.gif)


* preview dot/Graphviz source.
* updates preview as you type.
* interactive edge tracking.
* developers: you can pass a callback function that receives the webPanel when executing this extensions command. This allows you to override functionality that is provided by the webPanel like handlers for click/dblClick events.


## Developer Notes

### Interact with this extension

* add `graphviz-interactive-preview` to your `package.json` extension dependencies.
  
```json
{
    "name": "your-extension",
    //...
    "extensionDependencies": ["tintinweb.graphviz-interactive-preview"],
}
```

* create a new panel displaying the rendered dot graph. either provide a document or both the document and the graphviz dot source. The callback function receives the [webPanel](https://github.com/tintinweb/vscode-interactive-graphviz/blob/master/src/features/interactiveWebview.js#L144-L180). Overload `onClick(message)` to manually handle click events inside the dot graph or override the message handling routine `handleMessage(message)` to get access to all message events triggered inside the dot render window. 


```javascript
let args = {
    document: <vscode.document>,
    content: <string:dotSrc>,
    callback: <function (webpanel){}>
}
            
vscode.commands.executeCommand("interactive-graphviz.preview.beside", args)
```

## Credits

* graph engine: [d3-graphviz](https://github.com/magjac/d3-graphviz)
* edge tracking: [jquery.graphviz.svg](https://github.com/mountainstorm/jquery.graphviz.svg/)
* webview handling: [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/)

## Release Notes

see [CHANGELOG](./CHANGELOG.md)

### 0.0.2


-----------------------------------------------------------------------------------------------------------
