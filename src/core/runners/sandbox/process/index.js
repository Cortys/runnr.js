"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const api = require("../api");

const Graph = require("./graph/Graph");

// Get a ClientApi of the runner for this process:
const master = api.client(process).proxified;

const connector = {
	eventController: oweEvents.controller,
	graph: new Graph(master.runner.graph)
};

// Expose the connector to master:
api.server(process, owe.api(connector, owe.serve({
	router: {
		filter: new Set(["eventController", "graph"])
	}
})), {
	origin: {
		eventsApi: master.eventController
	}
});

console.log("[STARTED]");
