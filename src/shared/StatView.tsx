import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react";
import React, { useState } from "react";
import { InfoToolBar } from "./components/Toolbar";

type DataSelectorStatItem = {
  index: number,
  element: unknown,
  missingTarget: boolean,
  missingSource: boolean,
}

export type DataSelectorStat = undefined | DataSelectorStatItem[];

export default function StatView({
  stat,
}: {
    stat: DataSelectorStat
}) {
  const [show, setShow] = useState<boolean>(false);

  if (!stat) return <></>;

  return <>
    <InfoToolBar type="search" text="Not all elements could be parsed properly" infoButton={() => setShow(!show)} />
    {show && <VSCodeDataGrid>
      <VSCodeDataGridRow rowType="header">
        <VSCodeDataGridCell gridColumn="1">Index</VSCodeDataGridCell>
        <VSCodeDataGridCell gridColumn="2">Data</VSCodeDataGridCell>
        <VSCodeDataGridCell gridColumn="3">Missing Source</VSCodeDataGridCell>
        <VSCodeDataGridCell gridColumn="4">Missing Target</VSCodeDataGridCell>
      </VSCodeDataGridRow>
      {stat.map((i) => (
        <VSCodeDataGridRow>
          <VSCodeDataGridCell gridColumn="1">{i.index}</VSCodeDataGridCell>
          <VSCodeDataGridCell gridColumn="2">{JSON.stringify(i.element)}</VSCodeDataGridCell>
          <VSCodeDataGridCell gridColumn="3">{i.missingSource ? "yes" : "no"}</VSCodeDataGridCell>
          <VSCodeDataGridCell gridColumn="4">{i.missingTarget ? "yes" : "no"}</VSCodeDataGridCell>
        </VSCodeDataGridRow>
      ))}
    </VSCodeDataGrid>}
  </>;
}
