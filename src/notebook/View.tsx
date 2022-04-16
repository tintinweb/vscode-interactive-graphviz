import React from "react";
import { OutputItem } from "vscode-notebook-renderer";
import {
  Engine,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";

// @ts-ignore
import GraphvizWasm from "../../content/dist/graphvizlib.wasm";

import Toolbar, { InfoToolBar } from "./toolbar";

export default function View(
  {
    output,
  } : {output: OutputItem},

) : JSX.Element {
  console.log(output);
  const [graph, setGraph] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");

  React.useEffect(() => {
    graphvizVersion("dist", GraphvizWasm).then((t) => {
      console.log(`Graphviz Version: ${t}`);
    });
    graphvizSync(GraphvizWasm).then((syncObject) => {
      const res = syncObject.layout("digraph {a -> b}", "svg", engine);
      setGraph(res);
    });
  }, [output, engine]);

  return <>
    <Toolbar
      disableSearch
      disableDirectionSelection
      onChange={(eng, options) => { setEngine(eng); }}
    />
    <InfoToolBar type="search" text="Found x elements" />
    <InfoToolBar type="error" text="Syntax error" />
    <div dangerouslySetInnerHTML={{ __html: graph }}></div>
  </>;
}
