import React from "react";
import {
  VSCodeButton,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { Overlay } from "react-overlays";
import { Engine, Format } from "@hpcc-js/wasm/types/graphviz";
import DropDown from "./components/DropDown";
import Toolbar from "./components/Toolbar";
import TextField from "./components/TextField";

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

export default function GraphvizToolbar({
  disableDirectionSelection,
  disableEngineSelection,
  onExtract,
  onChange,
  onSave,
  onReset,
  onSearch,
  onSearchType,
  disabled,
} : {
  disabled?: boolean,
  disableSearch?: boolean,
  disableDirectionSelection?: boolean,
  disableEngineSelection?: boolean,
  onExtract?: () => void,
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
    <Toolbar>
      <div style={{
        height: "25px",
        display: "flex",
        alignItems: "center",
        marginRight: "3px",
      }}>
        {
          onSave && <><VSCodeButton
            disabled={disabled}
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
            {({ props }) => (
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
        {onReset && <VSCodeButton
          disabled={disabled}
          appearance="icon"
          aria-label="Reset view"
          onClick={onReset}
        >
          <span className="codicon codicon-refresh"></span>
        </VSCodeButton>}
      </div>
      {onSearch
      && <TextField
        disabled={disabled}
        placeholder="Search ..."
        onEnter={(s) => {
          onSearch(s, searchOptions);
        }}
        onType={(s) => {
          if (onSearchType) {
            onSearchType(s, searchOptions);
          }
        }}
      >
        <span slot="start" className="codicon codicon-search" />
        <VSCodeOption
          disabled={disabled}
          slot="end"
          selected={searchOptions.caseSensitive}
          onClick={() => setSearchOptions((s) => ({ ...s, caseSensitive: !s.caseSensitive }))}>
          <span className="codicon codicon-case-sensitive" />
        </VSCodeOption>
        <VSCodeOption
          disabled={disabled}
          slot="end"
          selected={searchOptions.regex}
          onClick={() => setSearchOptions((s) => ({ ...s, regex: !s.regex }))}>
          <span className="codicon codicon-regex" />
        </VSCodeOption>
        <VSCodeOption
          disabled={disabled}
          selected={showTypeSelection}
          slot="end"
          onClick={() => setShowTypeSelection(!showTypeSelection)}
          ref={refTypeButton as any}
        >
          <span className="codicon codicon-settings" />
        </VSCodeOption>
        <Overlay
          target={refTypeButton as any}
          show={showTypeSelection}
        >
          {({ props }) => (
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
      </TextField>}
      {onExtract && <VSCodeButton
        disabled={disabled}
        appearance="icon"
        onClick={onExtract}
      >
        <span className="codicon codicon-save"></span>
      </VSCodeButton>}
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
    </Toolbar>
  </>;
}
