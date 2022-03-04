function findEdges(text, searchFunction) {
  const $set = $();
  gv.edges().each((index, edge) => {
    if (edge.textContent && searchFunction(text, edge.textContent)) {
      $set.push(edge);
    }
  });
  return $set;
}

function findNodes(text, searchFunction, nodeName = true, nodeLabel = true) {
  const $set = $();

  const nodes = gv.nodesByName();
  for (const [nodeID, node] of Object.entries(nodes)) {
    if ((nodeName && searchFunction(text, nodeID))
            || (nodeLabel
                && (node.textContent && searchFunction(text, node.textContent) || !node.textContent && !nodeName && searchFunction(text, nodeID)))) {
      $set.push(node);
    }
  }
  return $set;
}

function findClusters(text, searchFunction, clusterName = true, clusterLabel = true) {
  const $set = $();

  const clusters = gv.clustersByName();
  for (const [clusterID, cluster] of Object.entries(clusters)) {
    if ((clusterName && searchFunction(text, clusterID))
            || (clusterLabel
                && (cluster.textContent && searchFunction(text, cluster.textContent) || !cluster.textContent && !clusterName && searchFunction(text, clusterID)))) {
      $set.push(cluster);
    }
  }
  return $set;
}

// main search function (is also used by API call)
function search(text, mode = "highlight", options = {}) {
  const opt = {
    type: options.type || "exact",
    case: options.case || "insensitive",
    direction: options.direction || "bidirectional",
    nodeName: options.nodeName,
    nodeLabel: options.nodeLabel,
    edgeLabel: options.edgeLabel,
    clusterName: options.clusterName,
    clusterLabel: options.clusterLabel,
  };

  if (mode === "search") {
    if (Object.keys(options).length > 0) {
      sendMessage("Options are not available in mode 'search'!");
    }
    findString(text);
    return;
  }

  let searchFunction;
  if (opt.type === "exact") {
    searchFunction = (search, str) => str.trim() === search.trim();
  } else if (opt.type === "included") {
    if (opt.case === "sensitive") {
      searchFunction = (search, str) => str.trim().indexOf(search) !== -1;
    } else {
      searchFunction = (search, str) => str.toUpperCase().trim().indexOf(search.toUpperCase()) !== -1;
    }
  } else if (opt.type === "regex") {
    searchFunction = (search, str) => {
      const regex = new RegExp(search, (opt.case === "insensitive" ? "i" : undefined));
      return !!str.trim().match(regex);
    };
  }

  if (mode === "highlight") {
    let $edges = $();
    if (opt.edgeLabel) {
      $edges = findEdges(text, searchFunction);
    }

    let $nodes = $();
    if (opt.nodeLabel || opt.nodeName) {
      $nodes = findNodes(text, searchFunction, opt.nodeName, opt.nodeLabel);
    }

    let $clusters = $();
    if (opt.clusterLabel || opt.clusterName) {
      $clusters = findClusters(text, searchFunction, opt.clusterName, opt.clusterLabel);
    }

    if (!opt.edgeLabel && !opt.nodeLabel && !opt.nodeName && !opt.clusterName && !opt.clusterLabel) {
      sendMessage("No search option chosen!");
    }

    return {
      nodes: $nodes,
      edges: $edges,
      clusters: $clusters,
    };
  }

  sendMessage("Invalid search Mode!");
}

function findString(str) {
  if (parseInt(navigator.appVersion) < 4) return;
  let strFound;
  if (window.find) {
    // CODE FOR BROWSERS THAT SUPPORT window.find
    strFound = self.find(str);
    if (strFound && self.getSelection && !self.getSelection().anchorNode) {
      strFound = self.find(str);
    }
    if (!strFound) {
      strFound = self.find(str, 0, 1);
      while (self.find(str, 0, 1)) continue;
    }
  } else if (navigator.appName.indexOf("Microsoft") != -1) {
    // EXPLORER-SPECIFIC CODE
    if (TRange != null) {
      TRange.collapse(false);
      strFound = TRange.findText(str);
      if (strFound) TRange.select();
    }
    if (TRange == null || strFound == 0) {
      TRange = self.document.body.createTextRange();
      strFound = TRange.findText(str);
      if (strFound) TRange.select();
    }
  }
  if (!strFound) {
    // flash box
  }
}
