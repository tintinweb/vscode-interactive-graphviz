import React, { useEffect, useMemo, forwardRef, useState, useImperativeHandle } from 'react';
import { graphviz, GraphvizOptions } from 'd3-graphviz';
import { BaseType, easeLinear, select, transition } from 'd3';
import { flatten } from 'lodash';
import { Engine } from '@hpcc-js/wasm/types/graphviz';
import { IRenderConfiguration } from '../../types/IRenderConfiguration';

import "./vscodeTheme.css";

interface IGraphvizProps {
  /**
   * A string containing a graph representation using the Graphviz DOT language.
   * @see https://graphviz.org/doc/info/lang.html
   */
  dot: string;
  /**
   * Options to pass to the Graphviz renderer.
   */
  //options?: GraphvizOptions;
  /**
   * The classname to attach to this component for styling purposes.
   */
  className?: string;

  engine: Engine,

  config?: IRenderConfiguration,

  onFinish?: () => void,
  onError?: (err: any) => void,
  onClick: (t: BaseType) => void,
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

const GraphvizD3 = forwardRef((
  { dot, className, engine = "dot", onError, onFinish, onClick, config }: IGraphvizProps, parentRef) => {
  const id = useMemo(getId, []);

  const [directory, setDirectory] = useState<undefined | {
    nodes: { [name: string]: BaseType },
    clusters: { [name: string]: BaseType },
    edges: { [name: string]: BaseType[] },
    resetView: () => any
  }>();

  useEffect(() => {
    const transit = transition("startTransition")
      .ease(easeLinear)
      .delay(config?.transitionDelay || 200)
      .duration(config?.transitionDuration || 500);
    const process = graphviz(`#${id}`, {
      ...defaultOptions,
      ...{
        engine: engine as any
      },
    })
      .fade(true)
      // @ts-ignore
      .transition(() => transit)
      .tweenPaths(true)
      .tweenShapes(true)
      .renderDot(dot)
      .onerror((err) => {
        if (onError)
          onError(err)
      })
      .on("end", () => {
        const nodesByName: { [name: string]: BaseType } = {};
        const clustersByName: { [name: string]: BaseType } = {};
        const edgesByName: { [name: string]: BaseType[] } = {};

        const svg = select(`#${id} svg`);
        // Extract data
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
        nodes.each(function () {
          let name = select(this).select("title").text();
          // remove any compass points:
          name = name.replace(/:[snew][ew]?/g, "");
          select(this).attr("data-name", name);
          nodesByName[name] = this;
        });

        // Extract edge data
        const edges = svg.select("g").selectAll(".edge");
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
        clusters.each(function () {
          let name = select(this).select("title").text();
          // remove any compass points:
          name = name.replace(/:[snew][ew]?/g, "");
          select(this).attr("data-name", name);
          clustersByName[name] = this;
        });

        // Make Nodes clickable
        nodes.on("click", function () {
          onClick(this);
        });

        setDirectory({ nodes: nodesByName, edges: edgesByName, clusters: clustersByName, resetView: process.resetZoom.bind(process) });

        if (onFinish)
          onFinish()
      });
  }, [dot, engine]);

  const highlight = (elements: BaseType[]) => {
    const svg = select(`#${id} svg`);

    // disable everything
    svg.select("g")
      .selectAll(".node ellipse, .edge path, .edge polygon, .node text, .edge polygon")
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
    select(`#${id} svg`).select("g").selectAll("ellipse, path, polygon, text").each(function () {
      const opacity = select(this).attr("data-opacity") || 1;
      select(this).style("opacity", opacity);
    });
  };

  const findEdges = (
    node: BaseType,
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