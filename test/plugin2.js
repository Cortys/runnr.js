"use strict";

/**package
{
	"name": "test-plugin-2",
	"displayName": "Test Plugin 2",
	"version": "0.1.0",
	"author": "Clemens Damke",
	"ports": {
		"in": {
			"input": {}
		},
		"out": {}
	}
}
**/

const stream = require("stream");

runnr.ports.in.input.pipe(new stream.Transform({
	transform(chunk, encoding, callback) {
		callback(null, String(chunk));
	},
	objectMode: true
})).pipe(process.stdout);
