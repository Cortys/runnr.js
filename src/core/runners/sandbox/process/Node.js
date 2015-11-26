"use strict";

const connector = require("./connector");

const graph = connector.master.route("runner", "graph");

class Node {
	constructor(node) {
		this.id = node.id;
		this.api = graph.route("nodes", node.id);
	}
}

module.exports = Node;
