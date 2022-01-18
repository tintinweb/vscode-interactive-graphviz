function findEdges(text, searchFunction) {
    var $set = $();
    gv.edges().each((index, edge) => {
        if (edge.textContent && searchFunction(text, edge.textContent)) {
            $set.push(edge);
        }
    })
    return $set;
}

function findNodes(text, searchFunction, nodeName = true, nodeLabel = true) {
    var $set = $()

    const nodes = gv.nodesByName();
    for (let [nodeName, node] of Object.entries(nodes)) {
        if ((nodeName && searchFunction(text, nodeName)) ||
            (nodeLabel &&
                (node.textContent && searchFunction(text, node.textContent) || !node.textContent && !nodeName && searchFunction(text, nodeName)))) {
            $set.push(node)
        }
    }
    return $set;
}



// main search function (is also used by API call)
function search(text, mode = "highlight", options = {}) {
    const opt = {
        type: options.type || "exact",
        direction: options.direction || "bidirectional",
        nodeName: options.nodeName,
        nodeLabel: options.nodeLabel,
        edgeLabel: options.edgeLabel
    }

    if (mode === "search") {
        if (Object.keys(options).length > 0) {
            sendMessage("Options are not available in mode 'search'!");
        }
        findString(text);
        return;
    }

    let searchFunction;
    if (opt.type === "exact") {
        searchFunction = (search, str) => {
            return str.trim() === search.trim()
        };
    } else if (opt.type === "included") {
        searchFunction = (search, str) => str.trim().indexOf(search) !== -1;
    } else if (opt.type === "regex") {
        searchFunction = (search, str) => {
            let regex = new RegExp(search);
            return !!str.trim().match(regex);
        }
    }

    if (mode === "highlight") {
        var $edges = $();
        if (opt.edgeLabel) {
            $edges = findEdges(text, searchFunction);
        }

        var $nodes = $();
        if (opt.nodeLabel || opt.nodeName) {
            $nodes = findNodes(text, searchFunction, opt.nodeName, opt.nodeLabel);
        }

        if (!opt.edgeLabel && !opt.nodeLabel && !opt.nodeName) {
            sendMessage("No search option chosen!");
        }

        return {
            nodes: $nodes,
            edges: $edges,
        }
    }

    sendMessage("Invalid search Mode!");
}

function findString(str) {
    if (parseInt(navigator.appVersion) < 4) return;
    var strFound;
    if (window.find) {
        // CODE FOR BROWSERS THAT SUPPORT window.find
        strFound = self.find(str);
        if (strFound && self.getSelection && !self.getSelection().anchorNode) {
            strFound = self.find(str)
        }
        if (!strFound) {
            strFound = self.find(str, 0, 1)
            while (self.find(str, 0, 1)) continue
        }
    } else if (navigator.appName.indexOf("Microsoft") != -1) {
        // EXPLORER-SPECIFIC CODE
        if (TRange != null) {
            TRange.collapse(false)
            strFound = TRange.findText(str)
            if (strFound) TRange.select()
        }
        if (TRange == null || strFound == 0) {
            TRange = self.document.body.createTextRange()
            strFound = TRange.findText(str)
            if (strFound) TRange.select()
        }
    }
    if (!strFound) {
        // flash box
    }
    return;
};