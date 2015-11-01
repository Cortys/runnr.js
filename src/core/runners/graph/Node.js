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

		const validatedPreset = nodeTypes[preset.type](preset);
		const exposed = ["id", ...Object.keys(validatedPreset)];
		const routes = new Set([
			...exposed,
			"edgesIn",
			"edgesOut",
			"edges",
			"predecessors",
			"successors",
			"neighbours",
			"delete"
		]);

		Object.assign(this, {
			id: preset.id,
			[graph]: parentGraph
		}, validatedPreset);

		if(this.type === "plugin") {
			Object.defineProperty(this, "plugin", {
				get: () => plugins.get(this.name)
			});

			routes.add("plugin");
		}

		const that = this;

		owe(this, owe.serve({
			router: {
				deep: true,
				filter: owe.switch(function() {
					return this.value === that ? "root" : "deep";
				}, {
					root: routes,
					deep: true
				})
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
		return new Set(this.edgesIn.map(edge => edge.fromNode));
	}

	get successors() {
		return new Set(this.edgesOut.map(edge => edge.toNode));
	}

	get neighbours() {
		return new Set(this.edges.map(edge => edge[edge.from.node === this.id ? "toNode" : "fromNode"]));
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
