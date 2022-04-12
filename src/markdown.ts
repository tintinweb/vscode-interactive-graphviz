interface JQuery {
  graphviz(a: {
    shrink: any,
    zoom: boolean,
  }): void;
}

interface GraphvizSvg {
  nodes(): JQuery
}

function contentLoaded() {
  const graphvizElements = document.getElementsByClassName("graphviz");

  for (let index = graphvizElements.length - 1; index >= 0; index -= 1) {
    const element = graphvizElements.item(index) as Element;

    const par = element?.parentElement?.parentElement;
    // eslint-disable-next-line no-continue
    if (!par) continue;

    par.replaceChild(element.children[0], par.children[0]);

    const svg = element.children[0];

    $(svg).graphviz({
      shrink: null,
      zoom: false,
    });
  }
}

window.addEventListener("load", () => {
  contentLoaded();
}, false);
