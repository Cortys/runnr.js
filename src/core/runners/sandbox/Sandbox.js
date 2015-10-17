"use strict";

const owe = require("owe.js");
const childProcess = require("child_process");
const path = require("path");

const sandbox = Symbol("sandbox");

class Sandbox {
	constructor(runner) {

		this.runner = runner;

		this[sandbox] = childProcess.fork(path.join(__dirname, "master"), {
			silent: true
		});

		this[sandbox].stdout.on("data", data => {
			process.stdout.write(`${this.runner.name} > ${data.toString()}`);
		});

		this[sandbox].stderr.on("data", data => {
			process.stderr.write(`${this.runner.name} > ${data.toString()}`);
		});

		this[sandbox].on("exit", () => {
			console.log("exit");
		});

		this[sandbox].on("error", err => {
			console.log("error", err);
		});

		owe(this);
		owe.expose.properties(this, []);
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
