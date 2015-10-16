"use strict";

const owe = require("owe.js");

const plugins = require("../../plugins");

const graph = Symbol("graph");

class Node extends require("events") {
	constructor(preset, parentGraph) {
		if(preset instanceof Node)
			return preset;

		if(typeof preset.id !== "number")
			throw new TypeError(`Invalid node id '${preset.id}'.`);

		if(!(preset.type in nodeTypes))
			throw new owe.exposed.Error(`Unknown node type '${preset.type}'.`);

		super();

		Object.assign(this, {
			id: preset.id,
			[graph]: parentGraph
		});

		const validatedPreset = nodeTypes[preset.type](preset);

		Object.assign(this, {
			id: preset.id,
			[graph]: parentGraph
		}, validatedPreset);

		const that = this;
		const exposed = ["id"].concat(Object.keys(validatedPreset));
		const routes = new Set(exposed.concat([
			"edgesIn",
			"edgesOut",
			"edges",
			"predecessors",
			"successors",
			"neighbours",
			"delete"
		]));

		owe(this, owe.serve({
			router: {
				deep: true,
				filter(route) {
					return this.value === that ? routes.has(route) : true;
				}
			},
			closer: {
				filter: true
			}
		}));
		owe.expose.properties(this, exposed);
	}

	get edgesIn() {
		const res = new Set();

		Object.keys(this[graph].edges).forEach(id => {
			const edge = this[graph].edges[id];

			if(edge.to.node === this.id)
				res.add(edge);
		});

		return res;
	}

	get edgesOut() {
		const res = new Set();

		Object.keys(this[graph].edges).forEach(id => {
			const edge = this[graph].edges[id];

			if(edge.from.node === this.id)
				res.add(edge);
		});

		return res;
	}

	get edges() {
		const res = new Set();

		Object.keys(this[graph].edges).forEach(id => {
			const edge = this[graph].edges[id];

			if(edge.from.node === this.id || edge.to.node === this.id)
				res.add(edge);
		});

		return res;
	}

	get predecessors() {
		const res = new Set();

		this.edgesIn.forEach(edge => res.add(edge.fromNode));

		return res;
	}

	get successors() {
		const res = new Set();

		this.edgesIn.forEach(edge => res.add(edge.toNode));

		return res;
	}

	get neighbours() {
		const res = new Set();

		this.edges.forEach(edge => res.add(edge[edge.from.node === this.id ? "toNode" : "fromNode"]));

		return res;
	}

	delete() {
		this.edges.forEach(edge => edge.delete());

		this.emit("delete");
	}
}

const nodeTypes = {
	__proto__: null,

	data(node) {
		return {
			type: "data",
			data: plugins.constraints.match(node.data, node.constraint),
			constraint: node.constraint,
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
			throw new owe.exposed.Error(`There is no plugin with the name '${node.name}'.`);

		return {
			type: "plugin",
			name: plugin.name,
			ports: plugin.ports
		};
	}
};

module.exports = Node;
