import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export function InfoToolBar(
  {
    text, type, children, infoButton,
  } : {
        text?: string,
        type: "search"|"error",
        infoButton?: () => void,
        children?: React.ReactNode,
    },
) : JSX.Element {
  if (!text || text === "") {
    return <></>;
  }
  return <div className={`toolbar toolbar-${type}`}>
    <span className="toolbar-item">
      {text}
    </span>
    {infoButton && <VSCodeButton appearance="icon" onClick={infoButton}>
      <span className="codicon codicon-info" />
    </VSCodeButton>}
    {children}
  </div>;
}

export default function Toolbar({
  children,
} : {
  children: React.ReactNode
}) : JSX.Element {
  return <>
    <div style={{
      display: "flex",
      marginLeft: "3px",
      marginTop: "3px",
    }}>
      {children}
    </div>
  </>;
}
