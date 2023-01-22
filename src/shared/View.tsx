import React from "react";
import { BaseType, select } from "d3";
import { flatten, uniq } from "lodash";

import { InfoToolBar } from "./components/Toolbar";
import Graphvizview from "./components/Graphviz";
import GraphvizToolbar, { Direction, SearchOptions } from "./GraphvizToolbar";
import { IRenderConfiguration } from "../IRenderConfiguration";

// // @ts-ignore
//import {Graphviz} from "@hpcc-js/wasm/graphviz";
import { Engine, Format } from "@hpcc-js/wasm/types/graphviz";
import GraphvizD3 from "./components/GraphvizD3";

export default function View(
  {
    source,
    config,
    saveFunction,
    onFinish,
    onError,
  }: {
    source?: string,
    config?: IRenderConfiguration,
    saveFunction: (data: string, type: Format) => void,
    onFinish?: () => void,
    onError?: (err: any) => void,
  },
): JSX.Element {
  const ref = React.useRef<{ direction: Direction }>();
  const graphvizView = React.useRef();
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

  React.useEffect(() => {
    setError("");
  }, [source, engine])

  React.useEffect(() => {
    if (graphvizView && graphvizView.current) {
      (graphvizView.current as any).highlight(highlights);
    }
  }, [highlights]);

  const streamSearch = (el: BaseType) => {
    if (!ref.current || !ref.current.direction) return undefined;
    const downstream: BaseType[] = (ref.current.direction === "Bidirectional" || ref.current.direction === "Downstream")
      ? (graphvizView.current as any).findLinkedFrom(el) : [];
    const upstream: BaseType[] = (ref.current.direction === "Bidirectional" || ref.current.direction === "Upstream")
      ? (graphvizView.current as any).findLinkedTo(el) : [];

    return uniq([...downstream, el, ...upstream]);
  };

  const searchNodesForEdges = (el: BaseType): (BaseType | undefined)[] => {
    if (!graphvizView || !graphvizView.current) return [undefined, undefined];

    const { directory } = graphvizView.current as any;

    const edgeName = select(el).attr("data-name");
    const [upStreamNodeName, downStreamNodeName, ...rest] = edgeName.split("->");
    if (rest && rest.length > 0) {
      return [undefined, undefined];
    }
    return [
      upStreamNodeName ? directory.nodes[upStreamNodeName] : undefined,
      downStreamNodeName ? directory.nodes[downStreamNodeName] : undefined,
    ];
  };

  const search = (searchString: string, searchOptions: SearchOptions) => {
    if (!graphvizView || !graphvizView.current) return undefined;

    const { directory } = graphvizView.current as any;
    // eslint-disable-next-line no-unused-vars
    let searchFunction: (str: string) => boolean;
    if (!searchOptions.regex) {
      if (searchOptions.caseSensitive) {
        searchFunction = (str: string) => str.trim().indexOf(searchString) !== -1;
      } else {
        searchFunction = (str: string) => str.toUpperCase()
          .trim().indexOf(searchString.toUpperCase()) !== -1;
      }
    } else {
      searchFunction = (str: string) => {
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
    <GraphvizToolbar
      disabled={!source}
      onSave={(a) => {
        if (a === "dot") {
          saveFunction(source as string, a);
        } else if (a === "svg") {
          saveFunction(graph, a);
        } else {
          console.error("unknown save function");
        }
      }}
      onReset={() => graphvizView && graphvizView.current && (graphvizView.current as any).reset()}
      onChange={(eng, dir) => {
        setEngine(eng);
        setDirection(dir);
      }}
      onSearch={(searchString, searchOptions) => {
        const res = search(searchString, searchOptions);
        if (!res
          || !graphvizView || !graphvizView.current
          || !ref || !ref.current) {
          return;
        }
        let h: BaseType[] = [];
        if (res.nodes) {
          h = [...h, ...uniq(flatten(res.nodes.map((node) => streamSearch(node) || [])))];
        }
        if (res.clusters) {
          h = [...h, ...res.clusters];
        }
        if (res.edges) {
          h = [...h, ...res.edges];
          res.edges.forEach((edge) => {
            const [upStreamNode, downStreamNode] = searchNodesForEdges(edge);
            if ((ref.current?.direction === "Bidirectional" || ref.current?.direction === "Downstream") && downStreamNode) {
              const r = streamSearch(downStreamNode) || [];
              h = [...h, ...r];
            }
            if ((ref.current?.direction === "Bidirectional" || ref.current?.direction === "Upstream") && upStreamNode) {
              const r = streamSearch(upStreamNode) || [];
              h = [...h, ...r];
            }
          });
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
        const results: string[] = [];
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
    {source && <GraphvizD3
      ref={graphvizView}
      config={config}
      onClick={(el) => {
        setHighlights(streamSearch(el) || []);
      }}
      dot={source}
      engine={engine}
      onError={(e: any) => {
        setError(e);
        if (onError)
          onError(e);
      }}
      onFinish={onFinish}
    />}
  </>;
}
