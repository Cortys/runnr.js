"use strict";

const owe = require("owe.js");

const connector = require("../connector");

const graph = connector.master.route("runner", "graph");

const nodeMap = new Map();

const nodes = module.exports = {
	init() {
		graph.route("nodes").then(nodes => Object.keys(nodes).forEach(nodeId => nodeMap.set(nodeId, new Node(nodes[nodeId]))));

		connector.register("nodes", nodes);
	},

	get: id => nodeMap.get(id)
};

owe(nodes);

const Node = require("./Node");
