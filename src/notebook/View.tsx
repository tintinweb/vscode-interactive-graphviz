import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import {
  Engine,
  Format,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";

// @ts-ignore
import GraphvizWasm from "../../content/dist/graphvizlib.wasm";

import Toolbar, { InfoToolBar } from "./toolbar";
import Graphviz from "./Graphviz";

export default function View(
  {
    output,
    context,
  } : {
    output: OutputItem,
    context: RendererContext<any>
  },
) : JSX.Element {
  const graphvizView = React.useRef();
  // console.log(output);
  // console.log(output.text());
  const [graph, setGraph] = React.useState("");
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");

  let source = output.text();
  source = source.substring(1, source.length - 1);

  // Render/Layout
  React.useEffect(() => {
    graphvizVersion("dist", GraphvizWasm).then((t) => {
      console.log(`Graphviz Version: ${t}`);
    });
    graphvizSync(GraphvizWasm).then((syncObject) => {
      setError("");
      try {
        // Layout and inject svg
        const res = syncObject.layout(source, "svg", engine);
        setGraph(res);
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [output, engine]);

  const saveFunction = (type: Format) => {
    let fileData: string;
    if (type === "dot") {
      fileData = source;
    } else if (type === "svg") {
      fileData = graph;
    } else {
      throw new Error("Unknown export file type!");
    }

    if (context && context.postMessage) {
      context.postMessage({
        action: "saveFile",
        payload: {
          type,
          data: fileData,
        },
      });
    }
  };

  return <>
    <Toolbar
      onSave={context.postMessage && saveFunction}
      onReset={() => graphvizView && graphvizView.current && (graphvizView.current as any).reset()}
      disableSearch
      disableDirectionSelection
      onChange={(eng/* , options */) => { setEngine(eng); }}
    />
    <InfoToolBar type="search" text={searchResult} />
    <InfoToolBar type="error" text={error} />
    <Graphviz dot={graph} ref={graphvizView} />
  </>;
}
