import React, {
  useEffect, useMemo, forwardRef, useState, useImperativeHandle,
} from "react";
import { graphviz, GraphvizOptions } from "d3-graphviz";
import {
  BaseType, easeLinear, select, transition,
} from "d3";
import { flatten } from "lodash";
// eslint-disable-next-line import/no-unresolved
import { Engine } from "@hpcc-js/wasm/types/graphviz";
import { IRenderCommunication, IRenderConfiguration } from "../../types/IRenderConfiguration";

import "./vscodeTheme.css";
import filterGraphviz from "../filterGraphviz";

interface IGraphvizProps {
  /**
   * A string containing a graph representation using the Graphviz DOT language.
   * @see https://graphviz.org/doc/info/lang.html
   */
  dot: string;
  /**
   * Options to pass to the Graphviz renderer.
   */
  // options?: GraphvizOptions;

  engine: Engine,

  config?: IRenderConfiguration,

  // eslint-disable-next-line no-unused-vars
  command?: (d: IRenderCommunication) => void,
  // eslint-disable-next-line no-unused-vars
  onError?: (err: any) => void,
  // eslint-disable-next-line no-unused-vars
  onClick: (t: BaseType, clickEvent?: PointerEvent) => void,
}

const defaultOptions: GraphvizOptions = {
  fit: true,
  height: 500,
  width: 500,
  zoom: true,
};

let counter = 0;
// eslint-disable-next-line no-plusplus
const getId = () => `graphviz${counter++}`;

const GraphvizD3 = forwardRef(({
  dot, engine = "dot", config, onClick, command, onError,
}: IGraphvizProps, parentRef) => {
  const id = useMemo(getId, []);

  const [directory, setDirectory] = useState<undefined | {
    nodes: { [name: string]: BaseType },
    clusters: { [name: string]: BaseType },
    edges: { [name: string]: BaseType[] },
    resetView:() => any
  }>();

  useEffect(() => {
    const transit = transition("startTransition")
      .ease(easeLinear)
      .delay(config?.transitionDelay || 200)
      .duration(config?.transitionDuration || 500);
    const process = graphviz(`#${id}`, {
      ...defaultOptions,
      ...{
        engine: engine as any,
      },
    })
      .fade(true)
      // @ts-ignore
      .transition(() => transit)
      .tweenPaths(true)
      .tweenShapes(true)
      .renderDot(dot)
      .onerror((err) => {
        if (onError) { onError(err); }
      })
      .on("end", () => {
        const nodesByName: { [name: string]: BaseType } = {};
        const clustersByName: { [name: string]: BaseType } = {};
        const edgesByName: { [name: string]: BaseType[] } = {};

        const svg = select(`#${id} svg`);
        // Extract data
        // eslint-disable-next-line func-names
        svg.selectAll("polygon,text,path").each(function () {
          const stroke = select(this).attr("stroke");
          const fill = select(this).attr("fill");
          const opacity = select(this).style("opacity");
          select(this).attr("data-stroke", stroke);
          select(this).attr("data-fill", fill);
          select(this).attr("data-opacity", opacity);
        });

        // Extract node data
        const nodes = svg.select("g").selectAll(".node");
        nodes.attr("pointer-events", "visible");
        // eslint-disable-next-line func-names
        nodes.each(function () {
          let name = select(this).select("title").text();
          // remove any compass points:
          name = name.replace(/:[snew][ew]?/g, "");
          select(this).attr("data-name", name);
          nodesByName[name] = this;
        });

        // Extract edge data
        const edges = svg.select("g").selectAll(".edge");
        // eslint-disable-next-line func-names
        edges.each(function () {
          let name = select(this).select("title").text();
          // remove any compass points:
          name = name.replace(/:[snew][ew]?/g, "");
          select(this).attr("data-name", name);
          if (edgesByName[name]) edgesByName[name].push(this);
          else edgesByName[name] = [this];
        });

        // Extract cluster data
        const clusters = svg.select("g").selectAll(".cluster");
        // eslint-disable-next-line func-names
        clusters.each(function () {
          let name = select(this).select("title").text();
          // remove any compass points:
          name = name.replace(/:[snew][ew]?/g, "");
          select(this).attr("data-name", name);
          clustersByName[name] = this;
        });

        // Make Nodes clickable
        // eslint-disable-next-line func-names
        nodes.on("click", function (clickEvent: PointerEvent) {
          onClick(this, clickEvent);
        });

        setDirectory({
          nodes: nodesByName,
          edges: edgesByName,
          clusters: clustersByName,
          resetView: process.resetZoom.bind(process),
        });
        if (command) {
          command({
            command: "onRenderFinished",
            value: {
              err: undefined,
            },
          });
        }
      });
  }, [dot, engine]);

  const extract = (elements: BaseType[]) => {
    const nodes: string[] = elements.filter((el) => el
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      && el.__data__.attributes.class === "node").map((el) => el.__data__.key);
    const edges : string[] = elements.filter((el) => el
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      && el.__data__.attributes.class === "edge").map((el) => el.__data__.key);

    return filterGraphviz(dot, nodes, edges);
  };

  // eslint-disable-next-line no-unused-vars
  const highlight = (elements: BaseType[]) => {
    const svg = select(`#${id} svg`);

    // disable everything
    svg.select("g")
      .selectAll(".node ellipse, .edge path, .edge polygon, .node text, .edge polygon, .edge text")
      // eslint-disable-next-line func-names
      .each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", 0.2 * (opacity as number));
      });

    // enable all highlights
    elements.forEach((element) => {
      // eslint-disable-next-line func-names
      select(element).selectAll("ellipse, path, polygon, text").each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", opacity);
      });
    });
  };

  const resetSelection = () => {
    // eslint-disable-next-line func-names
    select(`#${id} svg`).select("g").selectAll("ellipse, path, polygon, text").each(function () {
      const opacity = select(this).attr("data-opacity") || 1;
      select(this).style("opacity", opacity);
    });
  };

  const findEdges = (
    node: BaseType,
    // eslint-disable-next-line no-unused-vars
    testEdge: (edgeName: string, nodeName: string
    ) => string | undefined,
  ): { edges: BaseType[], nodeNames: string[] } | undefined => {
    if (!directory || !directory.edges || !node) return undefined;

    const nodeName = select(node).attr("data-name");
    const resultEdges: BaseType[] = [];
    const resultNodeNames: string[] = [];
    Object.keys(directory.edges).forEach((edgeName) => {
      const otherNodeName = testEdge(edgeName, nodeName);
      if (!otherNodeName) {
        return;
      }
      resultNodeNames.push(otherNodeName);
      directory.edges[edgeName].forEach((edge) => {
        resultEdges.push(edge);
      });
    });

    return {
      edges: resultEdges,
      nodeNames: resultNodeNames,
    };
  };

  const findLinked = (
    node: BaseType,
    // eslint-disable-next-line no-unused-vars
    testEdge: (edgeName: string, nodeName: string
    ) => string | undefined,
  ): BaseType[] => {
    if (!directory || !directory.nodes) return [];
    let searchNodes: BaseType[] = [node];
    const nodes: BaseType[] = [node];
    const edges: BaseType[] = [];

    while (searchNodes.length > 0) {
      const edgeResults = flatten(searchNodes.map((n) => findEdges(n, testEdge)));
      searchNodes = [];
      // eslint-disable-next-line no-loop-func
      edgeResults.forEach((r) => {
        if (!r) return;

        r.edges.forEach((edge) => {
          if (!edges.includes(edge)) edges.push(edge);
        });

        r.nodeNames.forEach((nodeName) => {
          const newNode = directory.nodes[nodeName];
          if (!newNode || nodes.includes(newNode)) return;

          nodes.push(newNode);
          searchNodes.push(newNode);
        });
      });
    }

    return [...nodes, ...edges];
  };

  const findLinkedFrom = (node: BaseType) => findLinked(
    node,
    (edgeName: string, nodeName: string): string | undefined => {
      const other = undefined;

      const connection = edgeName.split("->");
      if (connection.length > 1 && (connection[0] === nodeName || connection[0].startsWith(`${nodeName}:`))) {
        return connection[1].split(":")[0];
      }
      return other;
    },
  );

  const findLinkedTo = (node: BaseType) => findLinked(
    node,
    (edgeName: string, nodeName: string): string | undefined => {
      const other = undefined;

      const connection = edgeName.split("->");
      if (connection.length > 1 && (connection[1] === nodeName || connection[1].startsWith(`${nodeName}:`))) {
        return connection[0].split(":")[0];
      }
      return other;
    },
  );

  useImperativeHandle(parentRef, () => ({
    reset: directory?.resetView,
    resetSelection,
    highlight,
    extract,
    findLinked,
    findLinkedFrom,
    findLinkedTo,
    directory,
  }));

  return <div
    className={config && config.themeColors ? "vscodeTheme" : ""}
    id={id}
  />;
});

export { GraphvizD3, IGraphvizProps };
export default GraphvizD3;
