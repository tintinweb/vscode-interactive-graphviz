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
  console.log(output.text());
  const [graph, setGraph] = React.useState("");
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");

  React.useEffect(() => {
    graphvizVersion("dist", GraphvizWasm).then((t) => {
      console.log(`Graphviz Version: ${t}`);
    });
    graphvizSync(GraphvizWasm).then((syncObject) => {
      setError("");
      try {
        const source = output.text();
        const res = syncObject.layout(source.substring(1, source.length - 1), "svg", engine);
        setGraph(res);
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [output, engine]);

  return <>
    <Toolbar
      disableSearch
      disableDirectionSelection
      onChange={(eng/* , options */) => { setEngine(eng); }}
    />
    <InfoToolBar type="search" text={searchResult} />
    <InfoToolBar type="error" text={error} />
    <div dangerouslySetInnerHTML={{ __html: graph }}></div>
  </>;
}
