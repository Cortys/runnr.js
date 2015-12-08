"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const childProcess = require("child_process");
const path = require("path");

const api = require("./api");

const sandbox = Symbol("sandbox");

class Sandbox {
	constructor(runner) {
		this.runner = runner;

		this[sandbox] = childProcess.fork(path.join(__dirname, "process"), {
			silent: true,
			execArgv: []
		});

		this[sandbox].stdout.on("data",
			data => process.stdout.write(`${this.runner.name} (${this.runner.id}) > ${String(data).replace(/\n$/, "")}\n`));
		this[sandbox].stderr.on("data",
			data => process.stderr.write(`${this.runner.name} (${this.runner.id}) > ${String(data).replace(/\n$/, "")}\n`));

		// Start an owe client to request data from the sandbox's API:
		this.api = api.client(this[sandbox]);

		// Start an owe server for this sandbox's runner listening for requests from the sandbox:
		api.server(this[sandbox], owe.api({
			runner: this.runner,
			eventController: oweEvents.controller
		}, owe.serve.router()), {
			origin: {
				eventsApi: this.api.route("eventController")
			}
		});
	}

	/**
	 * Sandbox should not appear in the JSON.stringify outputs used in LokiJS.
	 * @return {undefined} Return nothing.
	 */
	toJSON() {
		return;
	}
}

module.exports = Sandbox;
