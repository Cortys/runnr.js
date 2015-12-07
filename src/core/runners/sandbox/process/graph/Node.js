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

		this.loaded = this.api.route("ports").then(ports => {
			Object.keys(ports.in).forEach(portName => {
				this.ports.in[portName] = new DualStream();
			});

			Object.keys(ports.out).forEach(portName => {
				this.ports.out[portName] = new DualStream();
			});
		});

		this.connected = Promise.all([this.api.route("edges", "out"), this.loaded]).then(result => {
			const edges = result[0];

			return Promise.all(edges.map(edge => {
				const toNode = this[graph].get(edge.to.node);

				if(!toNode)
					throw new Error(`Could not find node ${edge.from.node}.`);

				return toNode.loaded.then(() => {
					const source = this.ports.out[edge.from.port];

					if(!source)
						throw new Error(`Could not find port '${edge.from.port}' in node ${this.id}.`);

					const target = toNode.ports.in[edge.to.port];

					if(!target)
						throw new Error(`Could not find port '${edge.to.port}' in node ${toNode.id}.`);

					source.readable.pipe(target.writable);
				});
			}));
		});
	}
}

module.exports = Node;

const nodeTypes = {
	__proto__: null,

	data: require("./DataNode"),
	plugin: require("./PluginNode")
};
