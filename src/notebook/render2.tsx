import "../../content/dist/codicon.css";

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
      <div style={{
        height: "25px",
        display: "flex",
        alignItems: "center",
        marginRight: "3px",
      }}>
        <VSCodeButton id="toolbar" appearance="icon" aria-label="Save Graph">
          <span className="codicon codicon-save"></span>
        </VSCodeButton>
        <VSCodeButton id="menu-reset-zoom" appearance="icon" aria-label="Reset view">
          <span className="codicon codicon-refresh"></span>
        </VSCodeButton>
      </div>
      <VSCodeButton>Test</VSCodeButton>
    </div>
    <h2>Hello World</h2>
    <i>{output.mime}</i>
    <code>{output.text()}</code>
  </>;
}
