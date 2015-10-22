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
			process.stdout.write(`${this.runner.name} > ${data}`);
		});

		this[sandbox].stderr.on("data", data => {
			process.stderr.write(`${this.runner.name} > ${data}`);
		});

		this[sandbox].on("message", msg => this.handleMessage(msg));

		this.api = owe.api(this.runner).origin({
			sandbox: true
		});

		owe.expose.properties(this, []);
	}

	handleMessage(msg) {
		if(!msg || typeof msg !== "object" || msg.type !== "owe")
			return;

		let response = this.api;

		msg.route.forEach(route => response = response.route(route));

		response.close(msg.data).then(response => ({
			response
		}), error => ({
			response: error,
			error: true
		})).then(response => this[sandbox].send(Object.assign({
			type: "owe",
			id: msg.id
		}, response)));
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
