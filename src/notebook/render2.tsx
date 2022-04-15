import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import type { OutputItem } from "vscode-notebook-renderer";

export default function Render2(
  {
    output,
  } : {output: OutputItem},

) : JSX.Element {
  return <>
    <div style={{
      display: "flex",
      marginLeft: "3px",
      marginTop: "3px",
    }}>
    </div>
    <h2>Hello World</h2>
    <i>{output.mime}</i>
    <code>{output.text()}</code>
    <VSCodeButton>Test</VSCodeButton>
  </>;
}
