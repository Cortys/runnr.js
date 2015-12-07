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

console.log("I'm test-plugin-1 and my runnr is:", runnr);

setInterval(() => runnr.ports.out.timestamp.write(`${Date.now()}`, "utf8"), 1000);
