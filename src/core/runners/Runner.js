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
const updateGraph = Symbol("updateGraph");

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

		this[updateGraph] = () => super[update]();

		if(!(graph in this))
			this[graph] = new Graph();
	}

	[update](type, value) {
		super[update]();

		this.emit("update", type, value);
	}

	get name() {
		return this[name];
	}
	set name(val) {
		this[name] = helpers.validateName(val, this.name);
		this[update]("name", val);
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

		if(this[graph] === val)
			return;

		if(this[graph])
			this[graph].removeListener("update", this[updateGraph]);

		if(!(val instanceof Graph))
			val = new Graph(val);

		this[graph] = val;
		this[graph].on("update", this[updateGraph]);

		this[update]("graph", val);
	}

	activate() {
		this[active] = true;
		this[update]("active", true);

		return Promise.resolve(this);
	}

	deactivate() {
		this[active] = false;
		this[update]("active", false);

		return Promise.resolve(this);
	}

	delete() {
		return this.deactivate()
			.then(() => deleteRunner(this))
			.then(() => this.emit("delete"));
	}

	static add(runner) {
		return addRunner(runner, runner => new Runner(runner));
	}
}

module.exports = Runner;
