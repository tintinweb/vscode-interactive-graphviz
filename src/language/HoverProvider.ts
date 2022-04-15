/* eslint-disable class-methods-use-this */

import {
  // CancellationToken,
  Hover,
  Position,
  TextDocument,
  HoverProvider,
  Range,
} from "vscode";
import getAttributeDetail from "./getAttributeDetail";
// import { parseString } from "xml2js";

export default class DotHoverProvider implements HoverProvider {
  public provideHover(
    document: TextDocument,
    position: Position,
  // token: CancellationToken,
  ):
        Promise<Hover> {
    const startResult = document.getText(
      new Range(new Position(position.line, 0), position),
    ).match(/[{[\s;](\w+)$/);
    const endResult = document.getText(
      new Range(
        position,
        new Position(position.line, 65535),
      ),
    ).match(/^(\w*)\s*=/);

    // console.log(startResult);
    // console.log(endResult);

    if (!startResult || !endResult) {
      return Promise.reject();
    }

    const attr = startResult[1] + endResult[1];

    const md = getAttributeDetail(attr);
    if (!md) {
      return Promise.reject();
    }

    const ho = new Hover(
      md,
    );

    return Promise.resolve(ho);
  }
}
