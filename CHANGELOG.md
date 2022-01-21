# Change Log

## 0.1.0
- new: the code is now licensed as GPLv3. Feel free to reach out if you have any questions - #54
- new: vscode style user interface for the render window - #41 (thanks @bigbug)
- new: code refactored to typescript - #45 (thanks @bigbug)
- new: the extension is now compatible with the vscode web IDE (https://github.dev / https://vscode.dev) - #49 (thanks @bigbug)
- new: improved search (nodes/edges); edge multi-selection - #51 (thanks @bigbug)
- 
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