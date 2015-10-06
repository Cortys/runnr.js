"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");
const Graph = require("./Graph");

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
		if(typeof val !== "string")
			throw new owe.exposed.TypeError("Runner name has to be a string.");

		val = val.trim();

		if(val === "")
			throw new owe.exposed.TypeError("Runner name must not conist of whitespace.");

		if(val === this.name)
			return;

		if(name in this && require("./manage/helpers").exists(val))
			throw new owe.exposed.Error(`Runner with name '${val}' already exists.`);

		this[name] = val;
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
			.then(() => require("./manage/delete")(this))
			.then(() => this.emit("deleted"));
	}

	static add(runner) {
		return require("./manage/add")(runner, runner => new Runner(runner));
	}
}

module.exports = Runner;
