import "./toolbar.css";

import React from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";

export default function DropDown({
  options,
  onChange,
}:{
  initial: string,
  options: string[],
  // eslint-disable-next-line no-unused-vars
  onChange: (s: string) => void,
}) : JSX.Element {
  // const [selection, setSelection] = React.useState(initial);
  return <VSCodeDropdown style={{
    marginLeft: "5px",
    marginBottom: "2px",
  }}>
    {options.map((i) => <VSCodeOption onClick={
      () => {
        onChange(i);
      }
    }>
      {i}
    </VSCodeOption>)}
  </VSCodeDropdown>;
}
