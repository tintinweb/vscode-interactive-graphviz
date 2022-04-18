import "./toolbar.css";

import React from "react";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { Engine, Format } from "@hpcc-js/wasm";

export type Direction = "Bidirectional"| "Downstream"| "Upstream"| "Single";

export type SearchOptions = {
  regex: boolean,
  caseSensitive: boolean,
  nodeLabel: boolean,
  nodeName: boolean,
  edgeLabel: boolean,
  clusterLabel: boolean,
  clusterName: boolean,
}

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
  disableDirectionSelection,
  disableEngineSelection,
  onChange,
  onSave,
  onReset,
  onSearch,
  onSearchType,
} : {
  disableSearch?: boolean,
  disableDirectionSelection?: boolean,
  disableEngineSelection?: boolean,
  // eslint-disable-next-line no-unused-vars
  onChange?: (engine: Engine, direction: Direction) => void,
  // eslint-disable-next-line no-unused-vars
  onSave?: (type: Format) => void
  onReset?: () => void,
  // eslint-disable-next-line no-unused-vars
  onSearch?: (searchString: string, searchOptions: SearchOptions) => void,
  // eslint-disable-next-line no-unused-vars
  onSearchType?: (searchString: string, searchOptions: SearchOptions) => void,
}) : JSX.Element {
  const [engine, setEngine] = React.useState<string>("Dot");
  const [direction, setDirection] = React.useState<Direction>("Bidirectional");
  const [searchOptions, setSearchOptions] = React.useState<SearchOptions>({
    caseSensitive: false,
    regex: false,
    nodeLabel: true,
    nodeName: true,
    clusterLabel: true,
    clusterName: true,
    edgeLabel: true,
  });

  React.useEffect(() => {
    if (onChange) {
      onChange(engine.toLowerCase() as Engine, direction);
    }
  }, [engine, direction]);

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
        {onSave && <VSCodeButton appearance="icon" onClick={() => onSave("svg")}>
          <span className="codicon codicon-save"></span>
        </VSCodeButton>}
        {onReset && <VSCodeButton appearance="icon" aria-label="Reset view" onClick={onReset}>
          <span className="codicon codicon-refresh"></span>
        </VSCodeButton>}
      </div>
      {onSearch && <VSCodeTextField placeholder="Search ..."
        onKeyDown={(e) => {
          const searchString = (e.target as any).value;
          if (e.key !== "Enter") {
            if (onSearchType) {
              onSearchType(searchString, searchOptions);
            }
            return;
          }
          onSearch(searchString, searchOptions);
        }}>
        <span slot="start" className="codicon codicon-search"></span>
        <VSCodeOption slot="end" selected={searchOptions.caseSensitive} onClick={() => setSearchOptions((s) => ({ ...s, caseSensitive: !s.caseSensitive }))}>
          <span className="codicon codicon-case-sensitive"></span>
        </VSCodeOption>
        <VSCodeOption
          slot="end"
          selected={searchOptions.regex}
          onClick={() => setSearchOptions((s) => ({ ...s, regex: !s.regex }))}>
          <span className="codicon codicon-regex"></span>
        </VSCodeOption>
        {/* <VSCodeOption slot="end">
          <span className="codicon codicon-settings"></span>
        </VSCodeOption> */}
      </VSCodeTextField>}
      {!disableDirectionSelection && <DropDown
        initial="Bidirectional"
        options={["Bidirectional", "Downstream", "Upstream", "Single"]}
        onChange={(i) => setDirection(i as Direction)}
      />}
      {!disableEngineSelection && <DropDown
        initial="Dot"
        options={["Dot", "Circo", "FDP", "SFDP", "Neato", "Osage", "Patchwork", "Twopi"]}
        onChange={(i) => setEngine(i)}
      />}
    </div>
  </>;
}
