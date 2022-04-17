import {
  select, selectAll, zoom, zoomIdentity,
} from "d3";
import React, { forwardRef, useImperativeHandle } from "react";

export default forwardRef(({
  dot,
}:
{
    dot:string,
}, parentRef) : JSX.Element => {
  const ref = React.useRef<HTMLDivElement>(null);
  // Inject SVG and setup Zoom
  const [zoomFunc, zoomArea] = React.useMemo(() => {
    if (!ref.current || dot === "") return [undefined, undefined];

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
      const name = select(this).select("text").text();
      console.log(name);
    });

    // Extract edge data
    const edges = svg.select("g").selectAll(".edge");
    // eslint-disable-next-line func-names
    edges.each(function () {
      const name = select(this).select("title").text();
      console.log(name);
    });

    // eslint-disable-next-line func-names
    nodes.on("click", function () {
      svg.select("g").selectAll(".node ellipse, .edge path, .edge polygon, .node text, .edge polygon").each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", 0.2 * (opacity as number));
      });

      select(this).selectAll("ellipse, path, polygon, text").each(function () {
        const opacity = select(this).attr("data-opacity") || 1;
        select(this).style("opacity", opacity);
      });
    });

    return [zoomBehave, ar];
  }, [ref, ref.current, dot]);

  // Reset view on button click
  const resetView = () => {
    if (!zoomArea || !zoomFunc) return;
    zoomFunc.transform(zoomArea as any, zoomIdentity);
    select(ref.current).select("svg g").selectAll("ellipse, path, polygon, text").each(function () {
      const opacity = select(this).attr("data-opacity") || 1;
      select(this).style("opacity", opacity);
    });
  };

  useImperativeHandle(parentRef, () => ({
    reset: resetView,
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
