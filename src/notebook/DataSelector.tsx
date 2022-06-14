import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { get, isArray } from "lodash";
import React, { useEffect, useState } from "react";
import { digraph, INode, toDot } from "ts-graphviz";
import { OutputItem } from "vscode-notebook-renderer";
import StatView, { DataSelectorStat } from "./StatView";
import TextField from "./TextField";
import Toolbar, { InfoToolBar } from "./Toolbar";

enum DataSelectorState {
    loading,
    noData,
    json
}

type DataSelectorInfo = undefined | {
  type: "search" | "error",
  text: string,
}

export default function DataSelector({
  data,
  onUpdate,
}:{
  data: OutputItem,
  // eslint-disable-next-line no-unused-vars
  onUpdate: (a:string) => void
}) : JSX.Element {
  const [state, setState] = useState<DataSelectorState>(DataSelectorState.loading);

  const [selector, setSelector] = useState<string>("");
  const [source, setSource] = useState<string>("source");
  const [target, setTarget] = useState<string>("target");
  const [info, setInfo] = useState<DataSelectorInfo>();
  const [stat, setStat] = useState<DataSelectorStat>();

  useEffect(() => {
    try {
      const d = data.json();
      if (typeof (d) === "string") {
        let s = data.text();
        s = s.substring(1, s.length - 1);
        s = s.replace(/\\"/g, "\"");
        onUpdate(s);
        setState(DataSelectorState.noData);
      } else {
        setState(DataSelectorState.json);
      }
    } catch (e) {
      setState(DataSelectorState.noData);
    }
  }, [data]);

  useEffect(() => {
    if (state !== DataSelectorState.json) {
      setInfo(undefined);
      return;
    }
    const json = data.json();

    const g = digraph("G");
    const a = selector === "" ? json : get(json, selector);

    if (!isArray(a)) {
      setInfo({
        type: "error",
        text: "Data on selector is not an array!",
      });
      return;
    }

    const dict : {[n:string]: INode} = {};
    const localstat : DataSelectorStat = [];
    a.forEach((element, idx) => {
      const s = get(element, source);
      let tn: INode|undefined;
      let sn: INode|undefined;

      if (s) {
        sn = dict[s];
        if (!sn) {
          sn = g.createNode(s);
        }
      }
      const t = get(element, target);
      if (t) {
        tn = dict[t];
        if (!tn) {
          tn = g.createNode(t);
        }
      }

      if (!s || !t) {
        localstat.push({
          index: idx,
          element,
          missingSource: !s,
          missingTarget: !t,
        });
      }

      if (!(!sn || !tn)) g.createEdge([sn, tn]);
    });

    onUpdate(toDot(g));
    setInfo(undefined);

    if (localstat.length === 0) {
      setStat(undefined);
    } else {
      setStat(localstat);
    }
  }, [data, state, selector, source, target]);

  if (state === DataSelectorState.loading) {
    return <Toolbar>Loading ...</Toolbar>;
  }

  if (state === DataSelectorState.noData) {
    return <></>;
  }

  return <>
    <Toolbar>
      <VSCodeButton appearance="icon">
        <span className="codicon codicon-json" />
      </VSCodeButton>
      <TextField
        style={{ marginRight: "5px" }}
        onEnter={setSelector}
        placeholder="abc.def[3].ghi"
        initial={selector}
      >
        Selector
      </TextField>
      <TextField
        style={{ marginRight: "5px" }}
        onEnter={setSource}
        placeholder="abc.def[3].ghi"
        initial={source}
      >
        Source Field
      </TextField>
      <TextField
        style={{ marginRight: "5px" }}
        onEnter={setTarget}
        placeholder="abc.def[3].ghi"
        initial={target}
      >
        Target Field
      </TextField>
    </Toolbar>
    {info && <InfoToolBar type={info.type} text={info.text} />}
    <StatView stat={stat} />
  </>;
}
