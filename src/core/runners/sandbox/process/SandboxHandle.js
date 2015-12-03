"use strict";

const stream = require("stream");

class SandboxHandle {
	constructor(node) {
		this.ports = {
			in: {},
			out: {}
		};

		Object.keys(node.ports.in).forEach(name => {
			const port = this.ports.in[name] = new stream.Readable({
				read() {}
			});

			node.ports.in[name].partner = port;
		});

		Object.keys(node.ports.out).forEach(name => {
			this.ports.out[name] = new stream.Writable({
				write(data, encoding, callback) {
					node.ports.out[name].push(data);
					callback();
				}
			});
		});
	}
}

module.exports = SandboxHandle;
