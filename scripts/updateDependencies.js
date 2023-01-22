const fs = require("fs");

if (!fs.existsSync("content/dist/")) {
  fs.mkdirSync("content/dist/");
}

fs.copyFile("node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js", "content/dist/webviewuitoolkit.min.js", (err) => {
  if (err) throw err;
  console.log("webviewuitoolkit.min.js was copied to content/dist");
});

fs.copyFile("node_modules/@vscode/codicons/dist/codicon.css", "content/dist/codicon.css", (err) => {
  if (err) throw err;
  console.log("codicon.css was copied to content/dist");
});
fs.copyFile("node_modules/@vscode/codicons/dist/codicon.ttf", "content/dist/codicon.ttf", (err) => {
  if (err) throw err;
  console.log("codicon.ttf was copied to content/dist");
});
