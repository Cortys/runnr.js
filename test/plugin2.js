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

runnr.ports.in.input.pipe(process.stdout);
