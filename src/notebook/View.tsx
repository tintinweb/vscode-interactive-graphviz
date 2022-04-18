import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import {
  Engine,
  Format,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";
import { BaseType } from "d3";
import { uniq } from "lodash";

// @ts-ignore
import GraphvizWasm from "../../content/dist/graphvizlib.wasm";

import Toolbar, { InfoToolBar, SelectionOptions } from "./toolbar";
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
  const ref = React.useRef<{options: SelectionOptions}>();
  const graphvizView = React.useRef();
  // console.log(output);
  // console.log(output.text());
  const [graph, setGraph] = React.useState("");
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");
  const [options, setOptions] = React.useState<SelectionOptions>({
    caseSensitive: false,
    direction: "Bidirectional",
    regex: false,
  });

  // @ts-ignore
  ref.current = {
    options,
  };

  const [highlights, setHighlights] = React.useState<BaseType[]>([]);

  let source = output.text();
  source = source.substring(1, source.length - 1);
  source = source.replace(/\\"/g, "\"");

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

  React.useEffect(() => {
    if (graphvizView && graphvizView.current) {
      (graphvizView.current as any).highlight(highlights);
    }
  }, [highlights]);

  return <>
    <Toolbar
      onSave={context.postMessage && saveFunction}
      onReset={() => graphvizView && graphvizView.current && (graphvizView.current as any).reset()}
      disableSearch
      onChange={(eng, newOptions) => {
        setEngine(eng);
        setOptions(newOptions);
      }}
    />
    <InfoToolBar type="search" text={searchResult} />
    <InfoToolBar type="error" text={error} />
    <Graphviz
      dot={graph}
      ref={graphvizView}
      onClick={(el) => {
        if (!ref.current || !ref.current.options) return;
        const downstream = (ref.current.options.direction === "Bidirectional" || ref.current.options.direction === "Downstream")
          ? (graphvizView.current as any).findLinkedFrom(el) : [];
        const upstream = (ref.current.options.direction === "Bidirectional" || ref.current.options.direction === "Upstream")
          ? (graphvizView.current as any).findLinkedTo(el) : [];

        const toHighlight = uniq([...downstream, el, ...upstream]);
        setHighlights(toHighlight);
      }}
    />
  </>;
}
