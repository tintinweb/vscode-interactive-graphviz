import React from "react";
import { OutputItem } from "vscode-notebook-renderer";
import {
  Engine, graphviz, GraphvizSync, graphvizSync, graphvizVersion,
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

  graphvizVersion("dist", GraphvizWasm).then((t) => {
    console.log(t);
  });
  /* graphvizSync(GraphvizWasm).then((syncObject) => {
    syncObject.
  }); */

  return <>
    <Toolbar disableSearch disableDirectionSelection />
    <InfoToolBar type="search" text="Found x elements" />
    <InfoToolBar type="error" text="Syntax error" />
  </>;
}
