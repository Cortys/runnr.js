"use strict";

const { graph } = require("../../../graph");

function execute(node) {
	const io = {
		in: {},
		out: {}
	};

	Object.keys(node.ports.in).forEach(name => io.in[name] = node.ports.in[name].readable);
	Object.keys(node.ports.out).forEach(name => io.out[name] = node.ports.out[name].writable);

	graph.createExecutor(node.plugin.graph, io);
}

module.exports = execute;
