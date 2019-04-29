[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>


# vscode-interactive-graphviz
Interactive Graphviz Dot Preview for Visual Studio Code

* preview dot/Graphviz source
* updates preview as you type
* interactive edge tracking. click 


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

* create a new panel displaying the rendered dot graph. either provide a document or both the document and the graphviz dot source.
* 
    ```javascript
vscode.commands.executeCommand("interactive-graphviz.preview.beside", doc, dotSrcString)
    ```

## Credits

* graph engine: [d3-graphviz](https://github.com/magjac/d3-graphviz)
* edge tracking: [jquery.graphviz.svg](https://github.com/mountainstorm/jquery.graphviz.svg/)

## Release Notes

see [CHANGELOG](./CHANGELOG.md)

### 0.0.2


-----------------------------------------------------------------------------------------------------------
