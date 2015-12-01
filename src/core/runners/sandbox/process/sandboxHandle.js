"use strict";

const stream = require("stream");

class SandboxHandle {
	constructor(node) {
		this.ports = {
			in: {},
			out: {}
		};

		Object.keys(node.ports.in).forEach(name => {
			this.ports.in[name] = new stream.Readable();
		});

		Object.keys(node.ports.out).forEach(name => {
			this.ports.out[name] = new stream.Writable();
		});
	}
}

module.exports = SandboxHandle;
