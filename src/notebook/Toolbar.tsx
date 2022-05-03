import "./toolbar.css";

import React from "react";

export function InfoToolBar(
  { text, type } : {
        text?: string,
        type: "search"|"error"
    },
) : JSX.Element {
  if (!text || text === "") {
    return <></>;
  }
  return <div className={`toolbar toolbar-${type}`}>
    <span className="toolbar-item">
      {text}
    </span>
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
