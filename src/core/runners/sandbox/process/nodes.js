"use strict";

const owe = require("owe.js");

const connector = require("./connector");

const graph = connector.master.route("runner", "graph");
const Node = require("./Node");

const nodes = {
	init() {
		graph.route("nodes").then(nodes => Object.keys(nodes).forEach(nodeId => new Node(nodes[nodeId])));
	}
};

owe(nodes);

connector.register("nodes", nodes);

module.exports = nodes;
