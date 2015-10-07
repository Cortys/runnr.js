"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

const nodeTypes = {
	__proto__: null,

	plugin(node) {

	}
};

class Graph extends StoreItem {
	constructor(preset) {

		const exposed = ["nodes", "edges"];

		super(exposed, undefined, preset);

		if(!this.nodes)
			this.nodes = {};

		if(!this.edges)
			this.edges = {};

		if(!this.idCount)
			this.idCount = 1;

		owe(this, owe.serve({
			router: {
				filter: new Set(exposed.concat(["addNode", "addEdge"])),
				writable: false
			},
			closer: {
				filter: true,
				writable: false
			}
		}));
	}

	addNode(node) {
		if(!node || typeof node !== "object")
			throw new owe.exposed.TypeError("Nodes have to be objects.");

		if(!(node.type in nodeTypes))
			throw new owe.exposed.Error(`Unknown node type '${node.type}'.`);

		node = nodeTypes[node.type](node);
	}

	addEdge(from, to) {
		if(!from || !to || typeof from !== "object" || typeof to !== "object")
			throw new owe.exposed.TypeError("Edge endpoints have to be objects.");
	}
}

module.exports = Graph;
