"use strict";

const owe = require("owe.js");

const active = Symbol("active");

class Runner extends require("events") {
	constructor(preset) {

		super();

		Object.defineProperty(this, "active", {
			enumerable: true,
			get: () => this[active],
			set: val => this[val ? "activate" : "deactivate"]()
		});

		if(preset && typeof preset === "object")
			Object.assign(this, preset);

		owe(this, owe.serve({
			router: {
				filter: new Set(["name", "active", "activate", "deactivate", "delete"]),
				writable: new Set(["name", "active"])
			},
			closer: {
				filter: true,
				writable: true
			}
		}));

		owe.expose(this, () => this.exposed);
	}

	/* Exposed properties: */

	get exposed() {
		return {
			name: this.name,
			active: this.active
		};
	}

	/* Methods: */

	activate() {
		this[active] = true;
		this.emit("activeChanged", true);

		return Promise.resolve(this);
	}

	deactivate() {
		this[active] = false;

		return Promise.resolve(this);
	}

	delete() {
		return this.deactivate()
			.then(() => require("./manage/delete")(this))
			.then(() => this.emit("deleted"));
	}

	static add(runner) {
		return require("./manage/add")(runner, runner => new Runner(runner));
	}
}

module.exports = Runner;
