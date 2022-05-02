import { get, isArray } from "lodash";
import React, { useEffect, useState } from "react";
import { digraph, INode, toDot } from "ts-graphviz";
import { OutputItem } from "vscode-notebook-renderer";
import TextField from "./TextField";
import Toolbar, { InfoToolBar } from "./Toolbar";

enum DataSelectorState {
    loading,
    noData,
    json
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
  const [error, setError] = useState<string>("");

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
      setError("");
      return;
    }
    const json = data.json();

    const g = digraph("G");
    const a = selector === "" ? json : get(json, selector);

    if (!isArray(a)) {
      setError("Data on selector is not an array!");
      return;
    }

    const dict : {[n:string]: INode} = {};
    a.forEach((element) => {
      const s = get(element, source);
      if (!s) return;
      const t = get(element, target);
      if (!t) return;

      let sn = dict[s];
      if (!sn) {
        sn = g.createNode(s);
      }

      let tn = dict[t];
      if (!tn) {
        tn = g.createNode(t);
      }

      g.createEdge([sn, tn]);
    });

    onUpdate(toDot(g));
    setError("");
  }, [data, state, selector, source, target]);

  if (state === DataSelectorState.loading) {
    return <Toolbar>Loading ...</Toolbar>;
  }

  if (state === DataSelectorState.noData) {
    return <></>;
  }

  return <>
    <Toolbar>
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
    {error !== "" && <InfoToolBar type="error" text={error} />}
  </>;
}
