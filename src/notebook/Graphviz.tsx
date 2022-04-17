import {
  BaseType,
  select, zoom, zoomIdentity,
} from "d3";
import React, { forwardRef, useImperativeHandle } from "react";

export default forwardRef(({
  dot,
  onClick,
}:
{
    dot:string,
    onClick:(t:BaseType)=>void
}, parentRef) : JSX.Element => {
  const ref = React.useRef<HTMLDivElement>(null);
  // Inject SVG and setup Zoom
  const [zoomFunc, zoomArea, directory] = React.useMemo(() => {
    if (!ref.current || dot === "") return [undefined, undefined];

    const nodesByName : {[name:string]:BaseType} = {};
    const clustersByName : {[name:string]:BaseType} = {};
    const edgesByName : {[name:string]:BaseType} = {};

    // Render SVG
    select(ref.current).html(dot);

    // Initialize zoom
    const svg = select(ref.current).select("svg");
    svg.attr("width", "100%").attr("height", "100%");
    const zoomBehave = zoom()
      .scaleExtent([0, Infinity])
      .on("zoom", (e) => {
        svg.attr("transform", e.transform);
      });
    const ar = select(ref.current).call(zoomBehave as any);
    zoomBehave.transform(ar as any, zoomIdentity);

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
      const name = select(this).select("title").text();
      nodesByName[name] = this;
    });

    // Extract edge data
    const edges = svg.select("g").selectAll(".edge");
    // eslint-disable-next-line func-names
    edges.each(function () {
      const name = select(this).select("title").text();
      edgesByName[name] = this;
    });

    // Extract cluster data
    const clusters = svg.select("g").selectAll(".cluster");
    // eslint-disable-next-line func-names
    clusters.each(function () {
      const name = select(this).select("title").text();
      clustersByName[name] = this;
    });

    // Make Nodes clickable
    // eslint-disable-next-line func-names
    nodes.on("click", function () {
      onClick(this);
      /* svg.select("g")
      .selectAll(".node ellipse, .edge path, .edge polygon, .node text, .edge polygon")
      .each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", 0.2 * (opacity as number));
      });

      select(this).selectAll("ellipse, path, polygon, text").each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", opacity);
      }); */
    });

    return [zoomBehave, ar, { nodes: nodesByName, edges: edgesByName, clusters: clustersByName }];
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
    zoomFunc.transform(zoomArea as any, zoomIdentity);
    resetSelection();
  };

  const findLinked = (
    node: BaseType,
    testEdge: (edgeName: string, nodeName: string
      ) => boolean,
  ) : BaseType[] => {
    const result : BaseType[] = [];
    return result;
  };

  useImperativeHandle(parentRef, () => ({
    reset: resetView,
    resetSelection,
    highlight,
    findLinked,
    directory,
  }));

  return <div style={{
    width: "100%",
    height: "500px",
    overflow: "hidden",
    textAlign: "center",
  }}
  ref={ref}
  />;
});
