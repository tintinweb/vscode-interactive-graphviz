import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import {
  Engine,
  Format,
  graphvizSync, graphvizVersion,
} from "@hpcc-js/wasm";
import { BaseType } from "d3";
import { flatten, uniq } from "lodash";

// @ts-ignore
import GraphvizWasm from "../../content/dist/graphvizlib.wasm";

import Toolbar, { Direction, InfoToolBar, SearchOptions } from "./toolbar";
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
  const ref = React.useRef<{direction: Direction}>();
  const graphvizView = React.useRef();
  // console.log(output);
  // console.log(output.text());
  const [graph, setGraph] = React.useState("");
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");
  const [direction, setDirection] = React.useState<Direction>("Bidirectional");

  // @ts-ignore
  ref.current = {
    direction,
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

  const streamSearch = (el: BaseType) => {
    if (!ref.current || !ref.current.direction) return undefined;
    const downstream:BaseType[] = (ref.current.direction === "Bidirectional" || ref.current.direction === "Downstream")
      ? (graphvizView.current as any).findLinkedFrom(el) : [];
    const upstream: BaseType[] = (ref.current.direction === "Bidirectional" || ref.current.direction === "Upstream")
      ? (graphvizView.current as any).findLinkedTo(el) : [];

    return uniq([...downstream, el, ...upstream]);
  };

  const search = (searchString:string, searchOptions: SearchOptions) => {
    if (!graphvizView || !graphvizView.current) return undefined;

    const { directory } = graphvizView.current as any;
    // eslint-disable-next-line no-unused-vars
    let searchFunction:(str: string) => boolean;
    if (!searchOptions.regex) {
      if (searchOptions.caseSensitive) {
        searchFunction = (str: string) => str.trim().indexOf(searchString) !== -1;
      } else {
        searchFunction = (str:string) => str.toUpperCase()
          .trim().indexOf(searchString.toUpperCase()) !== -1;
      }
    } else {
      searchFunction = (str:string) => {
        const regex = new RegExp(searchString, (searchOptions.caseSensitive ? undefined : "i"));
        return !!str.trim().match(regex);
      };
    }

    const searchRes = {
      nodes: (!searchOptions.nodeName && !searchOptions.nodeLabel) ? undefined : flatten(Object
        .entries(directory.nodes)
        .filter(([key]) => searchFunction(key))
        .map(([, value]) => value)) as BaseType[],
      edges: (!searchOptions.edgeLabel) ? undefined : flatten(Object
        .entries(directory.edges)
        .filter(([key]) => searchFunction(key))
        .map(([, value]) => value)) as BaseType[],
      clusters: (!searchOptions.clusterName && !searchOptions.clusterLabel) ? undefined : Object
        .entries(directory.clusters)
        .filter(([key]) => searchFunction(key))
        .map(([, value]) => value) as BaseType[],
    };

    return searchRes;
  };

  return <>
    <Toolbar
      onSave={context.postMessage && saveFunction}
      onReset={() => graphvizView && graphvizView.current && (graphvizView.current as any).reset()}
      onChange={(eng, dir) => {
        setEngine(eng);
        setDirection(dir);
      }}
      onSearch={(searchString, searchOptions) => {
        const res = search(searchString, searchOptions);
        if (!res
          || !graphvizView || !graphvizView.current) {
          return;
        }
        let h : BaseType[] = [];
        if (res.nodes) {
          h = [...h, ...uniq(flatten(res.nodes.map((node) => streamSearch(node) || [])))];
        }
        if (res.clusters) {
          h = [...h, ...res.clusters];
        }
        setHighlights(h);
      }}
      onSearchType={(searchString, searchOptions) => {
        if (searchString === "") {
          setSearchResult("");
          return;
        }
        const res = search(searchString, searchOptions);
        if (!res) return;
        const results:string[] = [];
        if (res.nodes && (searchOptions.nodeLabel || searchOptions.nodeName)) {
          results.push(`${res.nodes.length} node${res.nodes.length === 1 ? "" : "s"}`);
        }
        if (res.edges && searchOptions.edgeLabel) {
          results.push(`${res.edges.length} edge${res.edges.length === 1 ? "" : "s"}`);
        }
        if (res.clusters && (searchOptions.clusterLabel || searchOptions.clusterName)) {
          results.push(`${res.clusters.length} cluster${res.clusters.length === 1 ? "" : "s"}`);
        }
        setSearchResult(`found ${results.join(", ")}`);
      }}
    />
    <InfoToolBar type="search" text={searchResult} />
    <InfoToolBar type="error" text={error} />
    <Graphviz
      dot={graph}
      ref={graphvizView}
      onClick={(el) => {
        setHighlights(streamSearch(el) || []);
      }}
    />
  </>;
}
