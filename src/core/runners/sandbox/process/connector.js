"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const api = require("../api");

const filter = new Set(["eventController"]);

// Get a ClientApi of the runner for this process:
const master = api.client(process);

const connector = {
	master,
	eventController: oweEvents.controller,

	register(name, object) {
		if(name in this)
			throw new TypeError(`There already is a connector route '${name}'.`);

		this[name] = object;

		filter.add(name);
	}
};

// Expose the connector to master:
api.server(process, owe.api(connector, owe.serve({
	router: { filter }
})), {
	origin: {
		eventsApi: master.route("eventController")
	}
});

module.exports = connector;
