import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { graphviz, GraphvizOptions } from 'd3-graphviz';
import { easeLinear, transition } from 'd3';
import { forwardRef } from 'react';

interface IGraphvizProps {
  /**
   * A string containing a graph representation using the Graphviz DOT language.
   * @see https://graphviz.org/doc/info/lang.html
   */
  dot: string;
  /**
   * Options to pass to the Graphviz renderer.
   */
  options?: GraphvizOptions;
  /**
   * The classname to attach to this component for styling purposes.
   */
  className?: string;

  onFinish?: () => void,
  onError?: (err: any) => void,
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

const GraphvizD3 = (
  { dot, className, options = {}, onError, onFinish }: IGraphvizProps) => {
  const id = useMemo(getId, []);

  useEffect(() => {
    const transit = transition("startTransition")
                .ease(easeLinear)
                .delay(200)
                .duration(500);
    graphviz(`#${id}`, {
      ...defaultOptions,
      ...options,
    })
    .fade(true)
    // @ts-ignore
    .transition(() => transit)
    .tweenPaths(true)
    .tweenShapes(true)
    .renderDot(dot).onerror((err) => {
      if(onError)
        onError(err)
    }).on("end", () => {
      if(onFinish)
        onFinish()
    });
  }, [dot, options]);

  return <div className={className} id={id} />;
};

export { GraphvizD3, IGraphvizProps };
export default GraphvizD3;