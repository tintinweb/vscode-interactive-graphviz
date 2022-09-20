import React, { useEffect, useState } from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import DataSelector from "./DataSelector";
import { IRenderConfiguration, IMessageSetConfiguration } from "../IRenderConfiguration";
import View from "./View";

export default function Bundle({
  context,
  outputItem,
} : {
    context: RendererContext<any>,
    outputItem: OutputItem,
}) : JSX.Element {
  const [source, setSource] = useState<string|undefined>();

  const [configuration, setConfiguration] = useState<IRenderConfiguration|undefined>();

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

  console.log(configuration);

  return <>
    <DataSelector data={outputItem} onUpdate={setSource} />
    {source && <View source={source} context={context} />}
  </>;
}
