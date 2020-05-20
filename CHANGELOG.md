# Change Log

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