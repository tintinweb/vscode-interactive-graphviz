import React from "react";
import { OutputItem, RendererContext } from "vscode-notebook-renderer";
import DataSelector from "./DataSelector";
import View from "./View";

export default function Bundle({
  context,
  outputItem,
} : {
    context: RendererContext<any>,
    outputItem: OutputItem,
}) : JSX.Element {
  const [source, setSource] = React.useState<string|undefined>();

  return <>
    <DataSelector data={outputItem} onUpdate={setSource} />
    {source && <View source={source} context={context} />}
  </>;
}
