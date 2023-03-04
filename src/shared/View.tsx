import React from "react";
import { BaseType, select } from "d3";
import { flatten, uniq } from "lodash";

// eslint-disable-next-line import/no-unresolved
import { Engine } from "@hpcc-js/wasm/types/graphviz";
import { Graphviz } from "@hpcc-js/wasm";
import { InfoToolBar } from "./components/Toolbar";
import GraphvizToolbar, { Direction, SearchOptions } from "./GraphvizToolbar";
import { IRenderCommunication, IRenderConfiguration } from "../types/IRenderConfiguration";

// eslint-disable-next-line import/no-named-as-default
import GraphvizD3 from "./components/GraphvizD3";

export default function View(
  {
    source,
    config,
    command,
  }: {
    // eslint-disable-next-line no-unused-vars
    command?: (data: IRenderCommunication) => void,
    source?: string,
    config?: IRenderConfiguration,
    onFinish?: () => void,
    // eslint-disable-next-line no-unused-vars
    onError?: (err: any) => void,
  },
): JSX.Element {
  const ref = React.useRef<{ direction: Direction }>();
  const graphvizView = React.useRef();
  const [searchResult, setSearchResult] = React.useState("");
  const [error, setError] = React.useState("");
  const [engine, setEngine] = React.useState<Engine>("dot");
  const [direction, setDirection] = React.useState<Direction>("Bidirectional");

  ref.current = {
    direction,
  };

  const [highlights, setHighlights] = React.useState<BaseType[]>([]);

  React.useEffect(() => {
    setError("");
  }, [source, engine]);

  React.useEffect(() => {
    if (graphvizView && graphvizView.current) {
      (graphvizView.current as any).highlight(highlights);
    }
  }, [highlights]);

  const streamSearch = (el: BaseType, searchDirection?: string) => {
    const dir = (searchDirection) || ref?.current?.direction;
    if (!dir) return undefined;
    const downstream: BaseType[] = (dir === "Bidirectional" || dir === "Downstream")
      ? (graphvizView.current as any).findLinkedFrom(el) : [];
    const upstream: BaseType[] = (dir === "Bidirectional" || dir === "Upstream")
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

  const extract = () => {
    const extractedData = (graphvizView.current as any).extract(highlights);
    if (!extractedData) return;
    if (command) {
      command({
        command: "openNewWindow",
        value: extractedData,
      });
    }
  };

  return <>
    <GraphvizToolbar
      disabled={!source}
      onExtract={
        (highlights && highlights.length > 0) ? extract : undefined
      }
      onSave={(a) => {
        if (!source) {
          console.error("noting to save!");
          return;
        }
        if (a === "dot") {
          if (command) {
            command({
              command: "saveAs",
              value: {
                data: source,
                type: a,
              },
            });
          }
        } else if (a === "svg") {
          Graphviz.load().then((gv) => {
            const d = gv.layout(source, undefined, engine);
            if (command) {
              command({
                command: "saveAs",
                value: {
                  data: d,
                  type: a,
                },
              });
            }
          });
        } else {
          console.error("unknown save function");
        }
      }}
      onReset={() => {
        if (!graphvizView || !graphvizView.current) return;
        (graphvizView.current as any).reset();
        (graphvizView.current as any).resetSelection();
      }}
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
              const r = streamSearch(downStreamNode, "Downstream") || [];
              h = [...h, ...r];
            }
            if ((ref.current?.direction === "Bidirectional" || ref.current?.direction === "Upstream") && upStreamNode) {
              const r = streamSearch(upStreamNode, "Upstream") || [];
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
      command={command}
      onError={(e: any) => {
        setError(e);
      }}
    />}
  </>;
}
