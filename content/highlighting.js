function highlight() {
  let highlightedNodes = $();
  for (const selection of currentSelection) {
    const nodes = getAffectedNodes(selection.set, selection.direction);
    highlightedNodes = highlightedNodes.add(nodes);
  }

  gv.highlight(highlightedNodes, true);
  //gv.bringToFront(highlightedNodes);
}

function getAffectedNodes($set, $mode = "bidirectional") {
  $result = $().add($set);
  if ($mode === "bidirectional" || $mode === "downstream") {
    $set.each((i, el) => {
      if (el.className.baseVal === "edge") {
        const edge = $(el).data("name");
        const nodes = gv.nodesByName();
        const downStreamNode = edge.split("->")[1];
        if (downStreamNode) {
          $result.push(nodes[downStreamNode]);
          $result = $result.add(gv.linkedFrom(nodes[downStreamNode], true));
        }
      } else {
        $result = $result.add(gv.linkedFrom(el, true));
      }
    });
  }
  if ($mode === "bidirectional" || $mode === "upstream") {
    $set.each((i, el) => {
      if (el.className.baseVal === "edge") {
        const edge = $(el).data("name");
        const nodes = gv.nodesByName();
        const upStreamNode = edge.split("->")[0];
        if (upStreamNode) {
          $result.push(nodes[upStreamNode]);
          $result = $result.add(gv.linkedTo(nodes[upStreamNode], true));
        }
      } else {
        $result = $result.add(gv.linkedTo(el, true));
      }
    });
  }
  return $result;
}
