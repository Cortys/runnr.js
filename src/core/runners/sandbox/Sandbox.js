"use strict";

const owe = require("owe.js");
const childProcess = require("child_process");
const path = require("path");

const apiServer = require("./api/server");

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

		owe.expose(this, {});

		// Start an owe server for this sandbox's runner listening for requests from the sandbox:
		apiServer(this[sandbox], owe.api(this.runner));
	}

	/**
	 * Sandbox should not appear in the JSON.stringify outputs used in LokiJS.
	 * @return {null} Return nothing.
	 */
	toJSON() {
		return null;
	}
}

module.exports = Sandbox;
