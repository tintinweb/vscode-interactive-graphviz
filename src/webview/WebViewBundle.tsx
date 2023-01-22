/* eslint-disable no-undef */
import { Format } from "@hpcc-js/wasm/types/graphviz";
import React, { useEffect, useState } from "react";
import { IRenderCommunication, IRenderConfiguration } from "../IRenderConfiguration";
import View from "../shared/View";

import "../shared/webviewStyle.css";

/** vscode ref * */
// @ts-ignore
const vscode = acquireVsCodeApi();

export default function WebViewBundle() {
  const [dot, setDot] = useState<undefined | string>();
  const [config, setConfig] = useState<undefined | IRenderConfiguration>()

  useEffect(() => {
    const receivedMessage = (a: { data: IRenderCommunication }) => {
      if (a.data && a.data.command === "renderDot") {
        setDot(a.data.value);
      } else if (a.data && a.data.command === "setConfiguration") {
        setConfig(a.data.value);
      } else {
        console.log("Unknown command");
        console.log(a);
      }
    };

    window.addEventListener("message", receivedMessage);
    vscode.postMessage({ command: "ready", value: {} } as IRenderCommunication);

    return () => {
      window.removeEventListener("message", receivedMessage);
    };
  }, []);

  // eslint-disable-next-line no-unused-vars
  const saveFunction = (data: string, type: Format) => {
    vscode.postMessage({
      command: "saveAs",
      value: {
        data,
        type,
      }
    } as IRenderCommunication);
  };

  const onFinish = () => {
    vscode.postMessage({ command: "onRenderFinished", value: {} } as IRenderCommunication);
  };
  const onError = (err: string) => {
    vscode.postMessage({ command: "onRenderFinished", value: { err } } as IRenderCommunication);
  };

  if (!dot) return <></>;

  return <View
    config={config}
    source={dot}
    saveFunction={saveFunction}
    onFinish={onFinish}
    onError={onError}
  />;
}
