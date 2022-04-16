import "./toolbar.css";

import React from "react";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { Engine } from "@hpcc-js/wasm";

type Direction = "Bidirectional"| "Downstream"| "Upstream"| "Single";

type SelectionOptions = {
  direction: Direction,
  caseSensitive: boolean,
  regex: boolean,
}

export function InfoToolBar(
  { text, type } : {
        text?: string,
        type: "search"|"error"
    },
) : JSX.Element {
  if (!text) {
    return <></>;
  }
  return <div className={`toolbar toolbar-${type}`}>
    <span className="toolbar-item">
      {text}
    </span>
  </div>;
}

function DropDown({
  initial,
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
    {options.map((i) => <VSCodeOption key={i} onClick={() => {
      // setSelection(i);
      onChange(i);
    }}>{i}</VSCodeOption>)}
  </VSCodeDropdown>;
}

export default function Toolbar({
  disableSearch,
  disableDirectionSelection,
  disableEngineSelection,
  onChange,
} : {
  disableSearch?: boolean,
  disableDirectionSelection?: boolean,
  disableEngineSelection?: boolean,
  onChange?: (engine: Engine, options: SelectionOptions) => void
}) : JSX.Element {
  const [engine, setEngine] = React.useState<string>("Dot");

  const [options, setOptions] = React.useState<SelectionOptions>({
    caseSensitive: false,
    regex: false,
    direction: "Bidirectional",
  });

  React.useEffect(() => {
    if (onChange) {
      onChange(engine.toLowerCase() as Engine, options);
    }
  }, [engine, options]);

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
        <VSCodeButton appearance="icon" aria-label="Save Graph">
          <span className="codicon codicon-save"></span>
        </VSCodeButton>
        <VSCodeButton appearance="icon" aria-label="Reset view">
          <span className="codicon codicon-refresh"></span>
        </VSCodeButton>
      </div>
      {!disableSearch && <VSCodeTextField placeholder="Search ..." id="searchInput">
        <span slot="start" className="codicon codicon-search"></span>
        <VSCodeOption slot="end" selected={options.caseSensitive} onClick={() => setOptions((s) => ({ ...s, caseSensitive: !s.caseSensitive }))}>
          <span className="codicon codicon-case-sensitive"></span>
        </VSCodeOption>
        <VSCodeOption
          slot="end"
          selected={options.regex}
          onClick={() => setOptions((s) => ({ ...s, regex: !s.regex }))}>
          <span className="codicon codicon-regex"></span>
        </VSCodeOption>
        {/* <VSCodeOption slot="end">
          <span className="codicon codicon-settings"></span>
        </VSCodeOption> */}
      </VSCodeTextField>}
      {!disableDirectionSelection && <DropDown
        initial="Bidirectional"
        options={["Bidirectional", "Downstream", "Upstream", "Single"]}
        onChange={(i) => setOptions((state) => ({ ...state, direction: i as Direction }))}
      />}
      {!disableEngineSelection && <DropDown
        initial="Dot"
        options={["Dot", "Circo", "FDP", "SFDP", "Neato", "Osage", "Patchwork", "Twopi"]}
        onChange={(i) => setEngine(i)}
      />}
    </div>
  </>;
}
