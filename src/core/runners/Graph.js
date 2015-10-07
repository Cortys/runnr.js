"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

const pluginHelpers = require("../plugins/manage/helpers");

const nodeTypes = {
	__proto__: null,

	data(node) {
		return {
			type: "data",
			data: node.data,
			constraint: pluginHelpers.validateConstraint(node.constraint)
		};
	},

	plugin(node) {
		if(!pluginHelpers.exists(node.name))
			throw new owe.exposed.Error(`There is no runner with the name '${node.name}'.`);

		return {
			type: "plugin",
			name: node.name
		};
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
				writable: false,
				deep: true,
				deepen: true
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

		node.id = this.idCount++;

		this.nodes[node.id] = node;
	}

	addEdge(from, to) {
		if(!from || !to || typeof from !== "object" || typeof to !== "object")
			throw new owe.exposed.TypeError("Edge endpoints have to be objects.");

		const edge = {

			id: this.idCount++,

			from: {
				node: from.node,
				port: from.port
			},
			to: {
				node: to.node,
				port: to.port
			}
		};

		this.edges[edge.id] = edge;
	}
}

module.exports = Graph;
