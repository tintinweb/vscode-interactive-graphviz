import {
  BaseType,
  select, zoom, zoomIdentity,
} from "d3";
import { flatten } from "lodash";
import React, { forwardRef, useImperativeHandle } from "react";

import "./vscodeTheme.css";

export default forwardRef(({
  dot,
  onClick,
}:
{
    dot:string,
    // eslint-disable-next-line no-unused-vars
    onClick:(t:BaseType)=>void
}, parentRef) : JSX.Element => {
  const ref = React.useRef<HTMLDivElement>(null);
  // Inject SVG and setup Zoom
  const [zoomFunc, zoomArea, directory, originalTransform] = React.useMemo(() => {
    if (!ref.current || dot === "") return [undefined, undefined];

    const nodesByName : {[name:string]:BaseType} = {};
    const clustersByName : {[name:string]:BaseType} = {};
    const edgesByName : {[name:string]:BaseType[]} = {};

    // Render SVG
    select(ref.current).html(dot);

    // Initialize zoom
    const svg = select(ref.current).select("svg");
    svg.attr("width", "100%").attr("height", "100%");
    const g = svg.select("g");
    const zoomBehave = zoom()
      // .scaleExtent([0, Infinity])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
      });
    const c = (g.node() as SVGGElement).transform.baseVal;
    // eslint-disable-next-line no-shadow
    let originalTransform;
    for (let i = 0; i < c.length; i += 1) {
      const item = c.getItem(i);
      if (item.type === 2) {
        originalTransform = [item.matrix.e, item.matrix.f];
      }
    }

    const ar = svg.call(zoomBehave as any);
    // zoomBehave.transform(ar as any, zoomIdentity);
    if (originalTransform) {
      zoomBehave.translateBy(svg as any, originalTransform[0], originalTransform[1]);
    }

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
    nodes.on("click", function () {
      onClick(this);
    });

    return [zoomBehave,
      ar,
      { nodes: nodesByName, edges: edgesByName, clusters: clustersByName },
      originalTransform];
  }, [ref, ref.current, dot]);

  const highlight = (elements: BaseType[]) => {
    if (!ref.current || dot === "") return;

    const svg = select(ref.current).select("svg");

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
    // eslint-disable-next-line func-names
    select(ref.current).select("svg g").selectAll("ellipse, path, polygon, text").each(function () {
      const opacity = select(this).attr("data-opacity") || 1;
      select(this).style("opacity", opacity);
    });
  };

  // Reset view on button click
  const resetView = () => {
    if (!zoomArea || !zoomFunc) return;
    const svg = select(ref.current).select("svg");
    zoomFunc.transform(zoomArea as any, zoomIdentity);
    if (originalTransform) {
      zoomFunc.translateBy(svg as any, originalTransform[0], originalTransform[1]);
    }
    resetSelection();
  };

  const findEdges = (
    node: BaseType,
    // eslint-disable-next-line no-unused-vars
    testEdge: (edgeName: string, nodeName: string
    ) => string|undefined,
  ): {edges: BaseType[], nodeNames:string[]}|undefined => {
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
      ) => string|undefined,
  ) : BaseType[] => {
    if (!directory || !directory.nodes) return [];
    let searchNodes : BaseType[] = [node];
    const nodes : BaseType[] = [node];
    const edges : BaseType[] = [];

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
    (edgeName:string, nodeName: string):string|undefined => {
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
    (edgeName:string, nodeName: string):string|undefined => {
      const other = undefined;

      const connection = edgeName.split("->");
      if (connection.length > 1 && (connection[1] === nodeName || connection[1].startsWith(`${nodeName}:`))) {
        return connection[0].split(":")[0];
      }
      return other;
    },
  );

  useImperativeHandle(parentRef, () => ({
    reset: resetView,
    resetSelection,
    highlight,
    findLinked,
    findLinkedFrom,
    findLinkedTo,
    directory,
  }));

  return <div style={{
    width: "100%",
    height: "500px",
    overflow: "hidden",
    textAlign: "center",
  }}
  className="vscodeTheme"
  ref={ref}
  />;
});
