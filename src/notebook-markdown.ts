import type * as MarkdownIt from "markdown-it";
import type { RendererContext } from "vscode-notebook-renderer";

interface MarkdownItRenderer {
    // eslint-disable-next-line no-unused-vars
    extendMarkdownIt(fn: (md: MarkdownIt) => void): void;
}

// eslint-disable-next-line import/prefer-default-export
export async function activate(ctx: RendererContext<void>) {
  const markdownItRenderer = await ctx.getRenderer("vscode.markdown-it-renderer") as MarkdownItRenderer | undefined;
  if (!markdownItRenderer) {
    throw new Error("Could not load 'vscode.markdown-it-renderer'");
  }

  markdownItRenderer.extendMarkdownIt((md: MarkdownIt) => {
    const { highlight } = md.options;
    // eslint-disable-next-line no-param-reassign
    md.options.highlight = (code:string, lang:string) => {
      if (lang && lang.match(/\bgraphviz\b/i)) {
        return `<div class="graphviz">${code}</div>`;
      }
      // @ts-ignore
      return highlight(code, lang);
    };

    return md;
  });
}
