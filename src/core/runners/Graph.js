"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

const plugins = require("../plugins");

const nodes = Symbol("nodes");
const edges = Symbol("edges");

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
				deep: true,
				filter: new Set(exposed)
			},
			closer: {
				filter: true
			}
		}));
	}

	get nodes() {
		return this[nodes];
	}
	set nodes(val) {
		this[nodes] = val;
	}

	get edges() {
		return this[edges];
	}
	set edges(val) {
		this[edges] = val;
	}

	addNode(node) {
		if(!node || typeof node !== "object")
			throw new owe.exposed.TypeError("Nodes have to be objects.");

		if(!(node.type in nodeTypes))
			throw new owe.exposed.Error(`Unknown node type '${node.type}'.`);

		node = nodeTypes[node.type](node);

		node.id = this.idCount++;

		this.nodes[node.id] = node;

		return node;
	}

	addEdge(from, to) {
		if(!from || !to || typeof from !== "object" || typeof to !== "object")
			throw new owe.exposed.TypeError("Edge endpoints have to be objects.");

		if(!(from.node in this.nodes))
			throw new owe.exposed.Error("Egde start-node does not exist.");

		if(!(to.node in this.nodes))
			throw new owe.exposed.Error("Egde end-node does not exist.");

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

		return edge;
	}

	getNode(id) {
		if(!(id in this.nodes))
			throw new owe.exposed.Error(`There is no node with the id ${id}.`);

		return this.nodes[id];
	}

	getEdge(id) {
		if(!(id in this.edges))
			throw new owe.exposed.Error(`There is no edge with the id ${id}.`);

		return this.edges[id];
	}

	deleteNode(id) {
		if(!(id in this.nodes))
			throw new owe.exposed.Error(`There is no node with the id ${id}.`);
	}

	deleteEdge(id) {
		if(!(id in this.edges))
			throw new owe.exposed.Error(`There is no edge with the id ${id}.`);
	}
}

const nodeTypes = {
	__proto__: null,

	data(node) {
		return {
			type: "data",
			data: plugins.constraints.match(node.data, node.constraint),
			ports: {
				in: {},
				out: {
					data: node.constraint
				}
			}
		};
	},

	plugin(node) {
		const plugin = plugins.get(node.name);

		if(!plugin)
			throw new owe.exposed.Error(`There is no runner with the name '${node.name}'.`);

		return {
			type: "plugin",
			name: plugin.name,
			ports: plugin.ports
		};
	}
};

module.exports = Graph;
