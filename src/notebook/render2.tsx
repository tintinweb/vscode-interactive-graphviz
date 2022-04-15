import "../../content/dist/codicon.css";
import "./toolbar.css";

import React from "react";
import {
  VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";

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
      <VSCodeTextField placeholder="Search ..." id="searchInput">
        <span slot="start" className="codicon codicon-search"></span>
        <VSCodeOption slot="end" id="search_case_sensitive">
          <span className="codicon codicon-case-sensitive"></span>
        </VSCodeOption>
        <VSCodeOption slot="end" id="search_regexbutton">
          <span className="codicon codicon-regex"></span>
        </VSCodeOption>
        <VSCodeOption slot="end" id="searchOptionButton">
          <span className="codicon codicon-settings"></span>
        </VSCodeOption>
      </VSCodeTextField>
      <VSCodeDropdown style={{
        marginLeft: "5px",
        marginBottom: "2px",
      }}>
        <VSCodeOption >Bidirectional</VSCodeOption>
        <VSCodeOption >Downstream</VSCodeOption>
        <VSCodeOption >Upstream</VSCodeOption>
        <VSCodeOption >Single</VSCodeOption>
      </VSCodeDropdown>
      <VSCodeDropdown style={{
        marginLeft: "5px",
        marginBottom: "2px",
      }}>
        <VSCodeOption >Dot</VSCodeOption>
        <VSCodeOption >Circo</VSCodeOption>
        <VSCodeOption >FDP</VSCodeOption>
        <VSCodeOption>Neato</VSCodeOption>
        <VSCodeOption>Osage</VSCodeOption>
        <VSCodeOption>Patchwork</VSCodeOption>
        <VSCodeOption>Twopi</VSCodeOption>
      </VSCodeDropdown>
    </div>

    <div id="searchtoolbar" className="toolbar toolbar-search">
      <span id="searchresult" className="toolbar-item">
        Searchresults
      </span>
    </div>

    <div id="faulttoolbar" className="toolbar toolbar-error">
      <span id="faultmessage" className="toolbar-item">
        This is an error message!
      </span>
    </div>

    <h2>Hello World</h2>
    <i>{output.mime}</i>
    <code>{output.text()}</code>
  </>;
}
