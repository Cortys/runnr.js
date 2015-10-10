"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

const plugins = require("../plugins");

const nodes = Symbol("nodes");
const edges = Symbol("edges");
const update = StoreItem.update;

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

class Graph extends StoreItem {
	constructor(preset) {

		const exposed = ["nodes", "edges"];

		super(exposed, exposed, preset);

		if(!this.nodes)
			this.nodes = {};

		if(!this.edges)
			this.edges = {};

		if(!this.idCount)
			this.idCount = 1;

		owe(this, owe.serve({
			router: {
				deep: true,
				filter: new Set(exposed.concat("add", "delete"))
			},
			closer: {
				filter: true
			}
		}));
	}

	[update](type, value) {
		this.emit("update", type, value);
	}

	get nodes() {
		return this[nodes];
	}
	set nodes(val) {
		this[nodes] = prepareGraphList(this, "Node", val);
		this[update]("nodes");
	}

	get edges() {
		return this[edges];
	}
	set edges(val) {
		this[edges] = prepareGraphList(this, "Edge", val);
		this[update]("edges");
	}

	addNode(node) {
		if(!node || typeof node !== "object")
			throw new owe.exposed.TypeError("Nodes have to be objects.");

		if(!(node.type in nodeTypes))
			throw new owe.exposed.Error(`Unknown node type '${node.type}'.`);

		node = nodeTypes[node.type](node);

		node.id = this.idCount++;

		this.nodes[node.id] = node;
		this[update]("addNode", node);

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
		this[update]("addEdge", edge);

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

		this[update]("deleteNode", id);
	}

	deleteEdge(id) {
		if(!(id in this.edges))
			throw new owe.exposed.Error(`There is no edge with the id ${id}.`);

		this[update]("deleteEdge", id);
	}
}

function prepareGraphList(graph, type, val) {
	val.add = graph[`add${type}`].bind(graph);
	Object.keys(val).forEach(key => val[key].delete = graph[`delete${type}`].bind(graph, key));

	return owe(val, owe.chain([
		owe.serve({
			router: {
				deep: true
			},
			closer: {
				filter: true
			}
		}),
		{
			router: graph[`get${type}`].bind(graph),
			closer() {
				throw undefined;
			}
		}
	], {
		errors: "last",
		removeNonErrors: true
	}), "rebind");
}

module.exports = Graph;
