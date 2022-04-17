import { select, zoom, zoomIdentity } from "d3";
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
    select(ref.current).html(dot);

    const svg = select(ref.current).select("svg");
    svg.attr("width", "100%").attr("height", "100%");
    const zoomBehave = zoom()
      .scaleExtent([0, Infinity])
      .on("zoom", (e) => {
        svg.attr("transform", e.transform);
      });
    const ar = select(ref.current).call(zoomBehave as any);
    zoomBehave.transform(ar as any, zoomIdentity);

    return [zoomBehave, ar];
  }, [ref, ref.current, dot]);

  // Reset view on button click
  const resetView = () => {
    if (!zoomArea || !zoomFunc) return;
    zoomFunc.transform(zoomArea as any, zoomIdentity);
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
