"use strict";

const stream = require("stream");

class SandboxHandle {
	constructor(node) {
		this.ports = {
			in: {},
			out: {}
		};

		Object.keys(node.ports.in).forEach(portName => {
			const port = this.ports.in[portName] = new stream.Readable({
				read() {}
			});

			node.ports.in[portName].partner = port;
		});

		Object.keys(node.ports.out).forEach(portName => {
			this.ports.out[portName] = new stream.Writable({
				write(data, encoding, callback) {
					node.ports.out[portName].push(data);
					callback();
				}
			});
		});
	}
}

module.exports = SandboxHandle;
