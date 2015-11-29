"use strict";

const stream = require("stream");

const connector = require("./connector");
const nodes = require("./nodes");

const graph = connector.master.route("runner", "graph");

class Node {
	constructor(node) {
		// Node is an abstract class.
		// If instanciated directly, the intended concrete class will be read from node.type and instanciated instead:
		if(new.target === Node) {
			if(!(node.type in nodeTypes))
				throw new Error(`Unknown node type '${node.type}'.`);

			return new nodeTypes[node.type](node);
		}

		this.id = node.id;
		this.type = node.type;
		this.api = graph.route("nodes", node.id);

		this.ports = {
			in: {},
			out: {}
		};

		this.loaded = Promise.all([
			this.api.route("edges"),
			this.api.route("ports").then(ports => {
				Object.keys(ports.in).forEach(portName => {
					this.ports.in[portName] = new stream.Writable();
				});

				Object.keys(ports.out).forEach(portName => {
					this.ports.out[portName] = new stream.Readable();
				});
			})
		]).catch(console.log);
	}
}

module.exports = Node;

const nodeTypes = {
	__proto__: null,

	data: require("./DataNode"),
	plugin: require("./PluginNode")
};
