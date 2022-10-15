import { window, workspace } from "vscode";

export default function saveFile(data: string, fileType: string) {
  let filter;
  if (fileType === "dot") {
    filter = { "Graphviz Dot Files": ["dot"] };
  } else if (fileType === "svg") {
    filter = { Images: ["svg"] };
  } else {
    window.showErrorMessage("Unknown file type for saving!");
    return;
  }
  window.showSaveDialog({
    saveLabel: "export",
    filters: filter,
  })
    .then((fileUri) => {
      if (fileUri) {
        try {
          const te = new TextEncoder();
          workspace.fs.writeFile(fileUri, te.encode(data))
            .then(() => {
              console.log("File Saved");
            }, (err : any) => {
              window.showErrorMessage(`Error on writing file: ${err}`);
            });
        } catch (err) {
          window.showErrorMessage(`Error on writing file: ${err}`);
        }
      }
    });
}
