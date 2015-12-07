"use strict";

const stream = require("stream");

class DualStream {
	constructor() {
		const readable = this.readable = new stream.Readable({
			read() {}
		});

		this.writable = new stream.Writable({
			write(chunk, encoding, callback) {
				readable.push(chunk);
				callback();
			}
		});

		this.writable.setDefaultEncoding("utf8");
	}
}

module.exports = DualStream;
