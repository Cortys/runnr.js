"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const api = require("../api");

const { graph } = require("../../../graph");

// Load in executors for PluginNodes:
require("../../../plugins/graph").registerExecutor();

// Get a ClientApi of the runner for this process:
const master = api.client(process).proxified;

const connector = {
	eventController: oweEvents.controller,
	graph: graph.createExecutor(master.runner.graph)
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

process.on("unhandledRejection", err => console.error("Unhandled Rejection:", err.stack));

console.log("[STARTED]");
