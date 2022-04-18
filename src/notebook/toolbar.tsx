import "./toolbar.css";

import React from "react";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { Engine, Format } from "@hpcc-js/wasm";
import { Overlay } from "react-overlays";

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

const overlayStyle : React.CSSProperties = {
  backgroundColor: "var(--vscode-editorPane-background)",
  padding: "5px",
};

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
  const refSaveButton = React.useRef();
  const refTypeButton = React.useRef();
  const refTextInput = React.useRef();

  const [showSaveOverly, setShowSaveOverlay] = React.useState(false);
  const [showTypeSelection, setShowTypeSelection] = React.useState(false);

  const saveFunction = (type: Format) => () => {
    setShowSaveOverlay(false);
    if (onSave) onSave(type);
  };

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

  React.useEffect(() => {
    if (!onSearchType || !refTextInput || !refTextInput.current) return;
    onSearchType((refTextInput.current as any).value, searchOptions);
  }, [searchOptions]);

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
        {
          onSave && <><VSCodeButton
            appearance="icon"
            onClick={() => setShowSaveOverlay(!showSaveOverly)}
            ref={refSaveButton as any}
          >
            <span className="codicon codicon-save"></span>
          </VSCodeButton>
          <Overlay
            target={refSaveButton as any}
            show={showSaveOverly}
          >
            {({ props/* , arrowProps, placement */ }) => (
              <div {...props}>
                <div style={overlayStyle}>
                  <VSCodeButton onClick={saveFunction("svg")}>SVG</VSCodeButton>
                  <VSCodeButton onClick={saveFunction("dot")}>DOT</VSCodeButton>
                </div>
              </div>
            )}
          </Overlay>
          </>
        }
        {onReset && <VSCodeButton appearance="icon" aria-label="Reset view" onClick={onReset}>
          <span className="codicon codicon-refresh"></span>
        </VSCodeButton>}
      </div>
      {onSearch && <VSCodeTextField
        placeholder="Search ..."
        ref={refTextInput as any}
        onKeyDown={(e) => {
          const searchString = (e.target as any).value;
          if (e.key !== "Enter") {
            return;
          }
          onSearch(searchString, searchOptions);
        }}
        onKeyUp={(e) => {
          const searchString = (e.target as any).value;
          if (e.key !== "Enter") {
            if (onSearchType) {
              onSearchType(searchString, searchOptions);
            }
          }
        }}
      >
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
        <VSCodeOption
          selected={showTypeSelection}
          slot="end"
          onClick={() => setShowTypeSelection(!showTypeSelection)}
          ref={refTypeButton as any}
        >
          <span className="codicon codicon-settings"></span>
        </VSCodeOption>
        <Overlay
          target={refTypeButton as any}
          show={showTypeSelection}
        >
          {({ props/* , arrowProps, placement */ }) => (
            <div {...props}>
              <div style={overlayStyle}>
                <VSCodeOption
                  selected={searchOptions.nodeLabel}
                  onClick={() => setSearchOptions((s) => ({
                    ...s,
                    nodeLabel: !s.nodeLabel,
                    nodeName: !s.nodeName,
                  }))}
                >Node
                </VSCodeOption>
                <VSCodeOption
                  selected={searchOptions.edgeLabel}
                  onClick={() => setSearchOptions((s) => ({
                    ...s,
                    edgeLabel: !s.edgeLabel,
                  }))}
                >Edge
                </VSCodeOption>
                <VSCodeOption
                  selected={searchOptions.clusterLabel}
                  onClick={() => setSearchOptions((s) => ({
                    ...s,
                    clusterLabel: !s.clusterLabel,
                    clusterName: !s.clusterName,
                  }))}
                >Cluster
                </VSCodeOption>
              </div>
            </div>
          )}
        </Overlay>
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
