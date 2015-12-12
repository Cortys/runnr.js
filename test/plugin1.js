"use strict";

/**package
{
	"name": "test-plugin-1",
	"displayName": "Test Plugin 1",
	"version": "0.1.0",
	"author": "Clemens Damke",
	"ports": {
		"in": {
			"name": {
				"constraint": "string"
			}
		},
		"out": {
			"name": {
				"constraint": "string"
			},
			"timestamp": {
				"constraint": "number"
			}
		}
	}
}
**/

runnr.ports.in.name.pipe(runnr.ports.out.name);

setInterval(() => runnr.ports.out.timestamp.write(`${Date.now()}`), 1000);
