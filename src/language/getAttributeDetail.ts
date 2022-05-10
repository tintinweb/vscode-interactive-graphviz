import { isString } from "lodash";
import { MarkdownString } from "vscode";
import documentation from "./documentation/documentation";

export default function getAttributeDetail(attribute: string) : MarkdownString|undefined {
  const filteredAttr = documentation.filter((i) => i.name === attribute);
  if (filteredAttr.length !== 1) {
    return undefined;
  }

  const a = filteredAttr[0];
  let md = `**${a.name}**  \n`;
  md += `Type: \`${isString(a.type) ? a.type : a.type.name}\`  \n`;
  md += a.desc;
  if (!isString(a.type) && a.type.restrictions) {
    md += `  \nAllowed values:\n${a.type.restrictions.map((i) => `- ${i}`).join("\n")}`;
  }
  return new MarkdownString(md);
}
