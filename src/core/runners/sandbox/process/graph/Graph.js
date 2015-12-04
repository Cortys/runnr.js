"use strict";

const owe = require("owe.js");

const Node = require("./Node");

class Graph {
	constructor(graph) {
		this.nodeMap = new Map();
		this.api = graph;

		graph.route("nodes").then(nodes => {
			Object.keys(nodes).forEach(nodeId => this.nodeMap.set(
				nodeId, new Node(nodes[nodeId], this)
			));
		});

		owe(this);
	}

	get(id) {
		return this.nodeMap.get(id);
	}
}

module.exports = Graph;
