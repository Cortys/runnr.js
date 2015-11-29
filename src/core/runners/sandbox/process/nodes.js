"use strict";

const owe = require("owe.js");

const connector = require("./connector");

const graph = connector.master.route("runner", "graph");

const nodeMap = new Map();

const nodes = module.exports = {
	init() {
		graph.route("nodes").then(nodes => Object.keys(nodes).forEach(nodeId => nodeMap.set(nodeId, new Node(nodes[nodeId]))));
	},

	get: id => nodeMap.get(id)
};

const Node = require("./Node");

owe(nodes);

connector.register("nodes", nodes);
