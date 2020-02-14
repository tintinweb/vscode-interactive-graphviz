# Change Log

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