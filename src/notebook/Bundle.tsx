import React, { useEffect, useState } from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import DataSelector from "../shared/DataSelector";
import { IRenderConfiguration, IMessageSetConfiguration } from "../IRenderConfiguration";
import View from "../shared/View";
import { Format } from "@hpcc-js/wasm/types/graphviz";

export default function Bundle({
  context,
  outputItem,
} : {
    context: RendererContext<any>,
    outputItem: OutputItem,
}) : JSX.Element {
  const [source, setSource] = useState<string|undefined>();

  const [configuration, setConfiguration] = useState<IRenderConfiguration>({
    themeColors: false,
    transitionDelay: 0,
    transitionDuration: 0,
  });

  const saveFunction = (data: string, type: Format) => {
    if (type !== "dot" && type !== "svg") {
      throw new Error("Unknown export file type!");
    }

    if (context && context.postMessage) {
      context.postMessage({
        action: "saveFile",
        payload: {
          type,
          data,
        },
      });
    }
  };

  useEffect(() => {
    // @ts-ignore
    context.onDidReceiveMessage((e: IMessageSetConfiguration) => {
      if (e.command === "setConfiguration") {
        setConfiguration(e.value);
      }
    });
    // @ts-ignore
    context.postMessage({ command: "ready" });
  }, []);

  return <>
    <DataSelector data={outputItem} onUpdate={setSource} />
    {<View source={source} config={configuration} saveFunction={saveFunction} />}
  </>;
}
