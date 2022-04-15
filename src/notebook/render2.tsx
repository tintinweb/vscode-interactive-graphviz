import React from "react";

import type { OutputItem } from "vscode-notebook-renderer";

export default function Render2(
  {
    output,
  } : {output: OutputItem},

) : JSX.Element {
  return <>
    <h2>Hello World</h2>
    <i>{output.mime}</i>
    <code>{output.text()}</code>
  </>;
}
