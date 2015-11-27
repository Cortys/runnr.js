"use strict";

const owe = require("owe.js");

const graph = Symbol("graph");
const oweRoutes = Symbol("routes");
const oweWritable = Symbol("writable");

class Node extends require("events") {
	constructor(preset, parentGraph) {
		// Node is an abstract class.
		// If instanciated directly, the intended concrete class will be read from preset.type and instanciated instead:
		if(new.target === Node) {
			if(typeof preset.id !== "number")
				throw new TypeError(`Invalid node id '${preset.id}'.`);

			if(!(preset.type in nodeTypes))
				throw new owe.exposed.Error(`Unknown node type '${preset.type}'.`);

			return Object.assign(new nodeTypes[preset.type](preset, parentGraph), {
				id: preset.id,
				type: preset.type
			});
		}

		super();

		this[graph] = parentGraph;

		const exposed = ["id", "type", "ports", ...preset];
		const routes = this[oweRoutes] = new Set([
			...exposed,
			"edgesIn",
			"edgesOut",
			"edges",
			"predecessors",
			"successors",
			"neighbours",
			"delete"
		]);

		const that = this;

		owe(this, owe.serve({
			router: {
				deep: true,
				filter: owe.switch(function() {
					return this.value === that ? "root" : "deep";
				}, {
					// Allow all routes included in "routes" for this instance:
					root: routes,
					// Allow all routes for child objects of this instance:
					deep: true
				}),
				writable: this[oweWritable] = new Set()
			},
			closer: {
				filter: true
			}
		}));
		owe.expose.properties(this, exposed);
	}

	get ports() {
		throw new owe.epxosed.Error(`Node#ports was not implemented by '${this.constructor.name}'.`);
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

Object.assign(Node, {
	routes: oweRoutes,
	writable: oweWritable
});

module.exports = Node;

const nodeTypes = {
	__proto__: null,

	data: require("./DataNode"),
	plugin: require("./PluginNode")
};
