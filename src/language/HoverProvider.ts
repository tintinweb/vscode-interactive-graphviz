/* eslint-disable class-methods-use-this */

import { filter, isString } from "lodash";
import {
  // CancellationToken,
  Hover,
  Position,
  TextDocument,
  HoverProvider,
  Range,
  MarkdownString,
} from "vscode";
import documentation from "./documentation/documentation";
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

    const filteredAttr = documentation.filter((i) => i.name === attr);
    if (filteredAttr.length !== 1) {
      return Promise.reject();
    }

    const a = filteredAttr[0];
    let md = `**${a.name}**  \n`;
    md += `Type: \`${isString(a.type) ? a.type : a.type.name}\`  \n`;
    md += a.desc;
    if (!isString(a.type) && a.type.restrictions) {
      md += `  \nAllowed values:\n${a.type.restrictions.map((i) => `- ${i}`).join("\n")}`;
    }

    const ho = new Hover(
      new MarkdownString(md),
    );

    return Promise.resolve(ho);
  }
}
