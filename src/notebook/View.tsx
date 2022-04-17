import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import {
  Engine,
  Format,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";
import {
  select, zoom, ZoomBehavior, zoomIdentity, zoomTransform,
} from "d3";

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

  // Inject SVG and setup Zoom
  const [zoomFunc, zoomArea] = React.useMemo(() => {
    if (!ref.current || graph === "") return [undefined, undefined];
    select(ref.current).html(graph);

    const svg = select(ref.current).select("svg");
    svg.attr("width", "100%").attr("height", "100%");
    const zoomBehave = zoom()
      .scaleExtent([0, Infinity])
      .on("zoom", (e) => {
        svg.attr("transform", e.transform);
      });
    const ar = select(ref.current).call(zoomBehave as any);
    zoomBehave.transform(ar as any, zoomIdentity);

    return [zoomBehave, ar];
  }, [ref, ref.current, graph]);

  // Reset view on button click
  const resetView = () => {
    if (!zoomArea || !zoomFunc) return;
    zoomFunc.transform(zoomArea as any, zoomIdentity);
  };

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
      onReset={resetView}
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
