# Change Log

## 0.1.2
- new: active editor window: context menu -> Preview Graphviz / DOT (beside) - #67

<img width="517" alt="image" src="https://user-images.githubusercontent.com/2865694/154029863-7d7dd582-2b9a-480c-b0de-bcccb9136ae4.png">

- new: button for editor title - #67

<img width="496" alt="image" src="https://user-images.githubusercontent.com/27259/154139064-d1966c0b-afb5-4f71-beb1-1792ed3b6e8b.png">


## 0.1.1
- new: the extension now bundles dot language support, syntax highlighting, snippets from [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz/) with permission from the author [@joaompinto](https://github.com/joaompinto) - #62
- new: completion provider - #62 
- new: Allow case insensitive matching in search - #64, #65

<img width="1197" alt="image" src="https://user-images.githubusercontent.com/2865694/154020180-563f189a-987c-4839-a5af-fa8ba80e9aa8.png">

## 0.1.0 🚀
- new: the code is now licensed as GPLv3. Feel free to reach out if you have any questions - #54
- new: vscode style user interface for the render window - #41 (thanks @bigbug)
- new: code refactored to typescript - #45 (thanks @bigbug)
- new: the extension is now compatible with the vscode web IDE (https://github.dev / https://vscode.dev) - #49 (thanks @bigbug)

  ![graphviz-web](https://user-images.githubusercontent.com/2865694/150638292-1967020e-7ad9-409d-b91f-8f7ae3598827.gif)


- new: improved search (nodes/edges); edge multi-selection - #51 (thanks @bigbug)
- fix: overlapping toolbar - #55 #56 (thanks @bigbug)
- fix: dev: npm install may fail on first checkout - #53
- fix: svg export does not escape angle brackets in node labels #11, #61

## 0.0.13
- new: show graphviz/dot error messages in preview - #26 (thanks @bigbug)
- new: configurable node highlight mode (Upstream/Downstream/Bidirectional) - #29 (thanks @bigbug)
- new: support port-based highlighting - #25 (thanks @bigbug)
- fix: inconsistent clicking behavior when highlighting node - fixes #21 #33 with changes of #34 (thanks @bigbug)
- fix: highlighting of multiple edges with same label - fixes #12, changeset of #30 (thanks @bigbug)
- new: show rendering progress in vscode - #36, #37, #42 (thanks @bigbug)
- new: updated dependencies and switched to WASM - #32 (thanks @bigbug)
- new: changed UI to use VS Code's Webview UI toolkit - #28 (thanks @bigbug)

## 0.0.12
- new: (API callback consumer) provide svg node attribs to callback for `onClick`, `onDblClick` events - #18

## 0.0.11
- fix: graph not rendering after vscode update 1.56.0 - #15

## 0.0.10
- optionally allow multiple graph windows per document - fixes #13 (thanks @kaftejiman)
- optionally allow customizing the render window title (default: filename of the document that's been passed in)
 
## 0.0.9
- Adopt VS Code's 'asWebviewUri' API #7

## 0.0.7 - 0.0.8
- ❗breaking change:
  - render command renamed from `interactive-graphviz.preview.beside` to `graphviz-interactive-preview.preview.beside`
- More control of behavior; Various fixes; Support for: render-lock, debouncing, inter-render interval; More in-code docs. #6 - thanks @michkot

## 0.0.6
- fix: tracing does not work after changing graph and re-rendering it #3
- fix: rendering for .dot files if graphviz language support is not installed. update graph for `languageId==DOT` or `filename.endsWith(DOT)`. might still not refresh for unsaved files. #4

## 0.0.5
- Add support for VSCode on Windows
  - change toolbar style to orange (okay for dark/light themes)
  - wait for page to load and then ask to render dot
  - normalize all path handling to work on both os's

## 0.0.4
- allow to export the current graph as `svg` or `dot`

## 0.0.1 - 0.0.3
- Initial release
