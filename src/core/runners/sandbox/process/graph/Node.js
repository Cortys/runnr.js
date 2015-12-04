"use strict";

const DualStream = require("./DualStream");

const graph = Symbol("graph");

class Node {
	constructor(preset, parentGraph) {
		// Node is an abstract class.
		// If instanciated directly, the intended concrete class will be read from preset.type and instanciated instead:
		if(new.target === Node) {
			if(!(preset.type in nodeTypes))
				throw new Error(`Unknown node type '${preset.type}'.`);

			return new nodeTypes[preset.type](preset, parentGraph);
		}

		this.id = preset.id;
		this.type = preset.type;
		this[graph] = parentGraph;
		this.api = parentGraph.api.route("nodes", preset.id);

		this.ports = {
			in: {},
			out: {}
		};

		this.loaded = Promise.all([
			this.api.route("edges"),
			this.api.route("ports").then(ports => {
				Object.keys(ports.in).forEach(portName => {
					this.ports.in[portName] = new DualStream();
				});

				Object.keys(ports.out).forEach(portName => {
					this.ports.out[portName] = new DualStream();
				});
			})
		]);
	}
}

module.exports = Node;

const nodeTypes = {
	__proto__: null,

	data: require("./DataNode"),
	plugin: require("./PluginNode")
};
