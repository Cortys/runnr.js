"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");
const Graph = require("./Graph");

const addRunner = require("./manage/add");
const deleteRunner = require("./manage/delete");
const helpers = require("./manage/helpers");

const name = Symbol("name");
const active = Symbol("active");
const graph = Symbol("graph");
const update = StoreItem.update;

class Runner extends StoreItem {
	constructor(preset) {

		const exposed = ["name", "active", "graph"];

		super(exposed, exposed, preset);

		owe(this, owe.serve({
			router: {
				filter: new Set(exposed.concat(["activate", "deactivate", "delete"])),
				writable: new Set(["name", "active"])
			},
			closer: {
				filter: true,
				writable: data => typeof data !== "object"
			}
		}));

		if(!(graph in this))
			this[graph] = new Graph();
	}

	get name() {
		return this[name];
	}
	set name(val) {
		this[name] = helpers.validateName(val, this.name);
		this[update]();
		this.emit("nameChanged", val);
	}

	get active() {
		return this[active];
	}
	set active(val) {
		this[val ? "activate" : "deactivate"]();
	}

	get graph() {
		return this[graph];
	}
	set graph(val) {
		if(!(val instanceof Graph))
			val = new Graph(val);

		this[graph] = val;
		this[update]();
		this.emit("graphChanged", val);
	}

	activate() {
		this[active] = true;
		this[update]();
		this.emit("activeChanged", true);

		return Promise.resolve(this);
	}

	deactivate() {
		this[active] = false;
		this[update]();
		this.emit("activeChanged", false);

		return Promise.resolve(this);
	}

	delete() {
		return this.deactivate()
			.then(() => deleteRunner(this))
			.then(() => this.emit("deleted"));
	}

	static add(runner) {
		return addRunner(runner, runner => new Runner(runner));
	}
}

module.exports = Runner;
