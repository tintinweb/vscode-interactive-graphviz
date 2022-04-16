import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import {
  Engine,
  Format,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";
import { select, zoom } from "d3";

// @ts-ignore
import GraphvizWasm from "../../content/dist/graphvizlib.wasm";

import Toolbar, { InfoToolBar } from "./toolbar";

export default function View(
  {
    output,
    context,
  } : {
    output: OutputItem,
    context: RendererContext<any>
  },
) : JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  // console.log(output);
  // console.log(output.text());
  const [graph, setGraph] = React.useState("");
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");

  let source = output.text();
  source = source.substring(1, source.length - 1);

  React.useEffect(() => {
    if (!ref.current) return;
    graphvizVersion("dist", GraphvizWasm).then((t) => {
      console.log(`Graphviz Version: ${t}`);
    });
    graphvizSync(GraphvizWasm).then((syncObject) => {
      setError("");
      try {
        // Layout and inject svg
        const res = syncObject.layout(source, "svg", engine);
        setGraph(res);
        select(ref.current).html(res);

        const svg = select(ref.current).select("svg");
        svg.attr("width", "100%").attr("height", "100%");
        const zoomBehavior = zoom()
          .scaleExtent([0, Infinity])
          .on("zoom", (e) => {
            svg.attr("transform", e.transform);
          });

        select(ref.current).call(zoomBehavior as any);
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
      disableSearch
      disableDirectionSelection
      onChange={(eng/* , options */) => { setEngine(eng); }}
    />
    <InfoToolBar type="search" text={searchResult} />
    <InfoToolBar type="error" text={error} />
    <div style={{
      width: "500px",
      height: "500px",
      overflow: "hidden",
      textAlign: "center",
    }} ref={ref}></div>
  </>;
}
