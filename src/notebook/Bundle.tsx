import React, { useEffect, useState } from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import DataSelector from "../shared/DataSelector";
import { IRenderConfiguration, IMessageSetConfiguration, IRenderCommunication } from "../IRenderConfiguration";
import View from "../shared/View";
import { Format } from "@hpcc-js/wasm/types/graphviz";

export default function Bundle({
  context,
  outputItem,
}: {
  context: RendererContext<any>,
  outputItem: OutputItem,
}): JSX.Element {
  const [source, setSource] = useState<string | undefined>();

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
        command: "saveAs",
        value: {
          type,
          data,
        },
      } as IRenderCommunication);
    }
  };

  useEffect(() => {
    if (!context) return;
    if (context.onDidReceiveMessage)
      context.onDidReceiveMessage((e: IRenderCommunication) => {
        if (e.command === "setConfiguration") {
          setConfiguration(e.value);
        }
      });
    if (context.postMessage)
      context.postMessage({ command: "ready" } as IRenderCommunication);
  }, []);

  return <>
    <DataSelector data={outputItem} onUpdate={setSource} />
    {<View source={source} config={configuration} saveFunction={saveFunction} />}
  </>;
}
