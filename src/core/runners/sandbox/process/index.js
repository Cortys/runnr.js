"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const api = require("../api");

const { graph } = require("../../../graph");

// Load in executors for PluginNodes:
require("../../../plugins/graph").registerExecutor();

console.log("[STARTED]");

// Get a ClientApi of the runner for this process:
const master = api.client(process).proxified;

graph.createExecutor(master.runner.graph).then(executor => {
	const connector = {
		eventController: oweEvents.controller,
		executor
	};

	// Expose the connector to master:
	api.server(process, owe.api(connector, owe.serve({
		router: {
			filter: new Set(["eventController", "executor"])
		}
	})), {
		origin: {
			eventsApi: master.eventController
		}
	});
});

process.on("unhandledRejection", err => console.error("Unhandled Rejection:", err.stack));
