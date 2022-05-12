# Change Log

## 0.3.0


- new: Outline View now shows an outline of the graph file. (using a parser lib with a fallback to regex symbol extraction under the hood) - #97

<img width="794" alt="image" src="https://user-images.githubusercontent.com/2865694/167640865-43d7caaf-4976-42ee-8f28-9748bda5a5e6.png">

- new: Auto Formatting for dot files - #99
  - <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>: `Format Document`

<img width="527" alt="image" src="https://user-images.githubusercontent.com/2865694/167641010-7c571b80-4dca-4298-b7b1-15e1d29f4597.png">



## 0.2.1

- new: Symbols, Rename and References (fixes #79) - #94
  - suggest proper symbols (Press `Ctrl+P` and afterwards enter `@`)

<img width="756" alt="Screenshot 2022-04-13 at 23 36 20" src="https://user-images.githubusercontent.com/27259/163274489-6bc4627e-f545-47f1-a674-a7b551583d34.png">

  - renaming

<img width="390" alt="Screenshot 2022-04-13 at 23 38 42" src="https://user-images.githubusercontent.com/27259/163274816-7a49ff59-c4a5-4d35-92b6-7958b32cad7b.png">

  - references

<img width="666" alt="Screenshot 2022-04-13 at 23 40 07" src="https://user-images.githubusercontent.com/27259/163274997-6e696418-c9de-4fa8-800d-fbf0bee2e7de.png">

- new: Improved toolbar styling for different themes - #100

<img width="674" alt="Screenshot 2022-04-15 at 12 07 57" src="https://user-images.githubusercontent.com/27259/163558499-d2c552e6-2b07-4299-8f5d-53dca9361a84.png">

<img width="674" alt="Screenshot 2022-04-15 at 12 09 06" src="https://user-images.githubusercontent.com/27259/163558623-117ce7de-9c99-4c2e-8613-32af1d05df6f.png">

<img width="674" alt="Screenshot 2022-04-15 at 12 08 43" src="https://user-images.githubusercontent.com/27259/163558637-e9074a64-15cb-4970-aca5-b59287cbdd76.png">

- fix: Keep search bar while rendering - #102 fixes #101

- update: Documentation information on Hover and on CodeCompletion have been harmonised - #103


## 0.2.0

- new: Implements Selection of Render Engine - #85 fixes #69

<img width="576" alt="Screenshot 2022-03-31 at 22 46 36" src="https://user-images.githubusercontent.com/27259/161146471-6fb269df-5e3a-4f71-ab6e-37391b33c09c.png">

- new: Provide color decorator - #86 fixes #77

<img width="472" alt="image" src="https://user-images.githubusercontent.com/2865694/163130099-30227a10-e471-4fe0-9564-1d3338f09726.png">

- new: Hover Information -  #88 fixes #76

<img width="303" alt="Screenshot 2022-04-01 at 13 05 39" src="https://user-images.githubusercontent.com/27259/161251962-6aa3792c-70da-4f48-a9fa-5933012fede2.png">

- fix: Clicking on the background brings it to foreground, covering the nodes - #90 fixes #70

- new: Show Diagnostic errors in the editor's "Problems" view - #89 fixes #75

<img width="576" alt="image" src="https://user-images.githubusercontent.com/2865694/163143275-05f0547b-ce69-43ce-af66-ed76b1f7aa88.png">

- new: Improved CompletionProvider - #91
- update: Webview UI toolkit updated to 1.0.0 #92

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
