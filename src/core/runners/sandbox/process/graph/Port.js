"use strict";

const stream = require("stream");

const constraints = require("../../../../graph/constraints");

class Port {
	constructor(constraint) {
		const readable = this.readable = new stream.Readable({
			read() {},
			objectMode: !constraint.binary
		});

		this.writable = new stream.Writable({
			write(data, encoding, callback) {
				try {
					readable.push(constraints.match(data, constraint));
				}
				catch(error) {}

				callback();
			},
			objectMode: !constraint.binary
		});

		this.writable.setDefaultEncoding("utf8");
	}
}

module.exports = Port;
