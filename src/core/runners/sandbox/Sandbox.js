"use strict";

const owe = require("owe.js");
const childProcess = require("child_process");
const path = require("path");

const api = require("./api");
const events = require("./api/events");

const sandbox = Symbol("sandbox");

class Sandbox {
	constructor(runner) {
		this.runner = runner;

		this[sandbox] = childProcess.fork(path.join(__dirname, "process"), {
			silent: true
		});

		this[sandbox].stdout.on("data",
			data => process.stdout.write(`${this.runner.name} > ${data}`));
		this[sandbox].stderr.on("data",
			data => process.stderr.write(`${this.runner.name} > ${data}`));

		// Start an owe server for this sandbox's runner listening for requests from the sandbox:
		api.server(this[sandbox], owe.api({
			runner: this.runner,
			receiver: events.receiver
		}, owe.serve.router()));

		// Start an owe client to request data from the sandbox's API:
		this.api = api.client(this[sandbox]);

		// TEST:
		this.api.route("greeting").then(greeting => console.log(`${this.runner.name} responds '${greeting}'.`));

		let i = 0;
		const fn = data => {
			console.log(`${this.runner.name} emits '${data}'.`);
			if(++i > 1)
				this.api.route("emitter").removeListener("test", fn).catch(console.error);
		};

		this.api.route("emitter").on("newListener", (event, listener) => {
			console.log("new", event, listener);
		});

		this.api.route("emitter").on("removeListener", (event, listener) => {
			console.log("removed", event, listener);
		});

		this.api.route("emitter").on("test", fn).catch(
			err => console.error("error", err)
		);
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
