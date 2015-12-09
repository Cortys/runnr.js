"use strict";

const owe = require("owe.js");

const internalize = require("../helpers/internalize");
const persist = require("../helpers/persist");

const Graph = require("../graph/Graph");
const Sandbox = require("./sandbox/Sandbox");

const addRunner = require("./manage/add");
const deleteRunner = require("./manage/delete");
const helpers = require("./manage/helpers");

const name = Symbol("name");
const active = Symbol("active");
const graph = Symbol("graph");
const update = Symbol("update");

class Runner extends require("../EventEmitter") {
	constructor(preset) {
		super();
		internalize(this, ["name", "active", "graph"]);

		Object.assign(this, {
			[active]: false
		}, preset);

		if(!(graph in this))
			this.graph = new Graph({}, this);

		/* owe binding: */

		const exposed = ["id", "name", "active"];

		owe(this, owe.serve({
			router: {
				filter: new Set([...exposed, "graph", "activate", "deactivate", "delete"]),
				writable: new Set(["name"])
			},
			closer: {
				filter: true,
				writable: data => typeof data !== "object"
			}
		}));
		owe.expose.properties(this, exposed);
	}

	[update](type, value) {
		persist(this);
		this.emit("update", type, value);
	}

	get id() {
		return this.$loki;
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
			this[graph].removeListener("update", () => persist(this));

		const set = () => {
			this[graph] = val;
			this[graph].on("update", () => persist(this));

			this[update]("graph", val);
		};

		if(val instanceof Graph)
			set();
		else
			// Graphs with data are initialized async because they require a loaded Loki DB:
			setImmediate(() => {
				val = new Graph(val, this);
				set();
			});
	}

	activate() {
		if(this[active])
			return Promise.resolve(true);

		if(!this.sandbox)
			this.sandbox = new Sandbox(this);

		this[update]("active", this[active] = true);

		return Promise.resolve(true);
	}

	deactivate() {
		if(!this[active] || !this.sandbox) {
			if(this[active])
				this[update]("active", this[active] = false);

			return Promise.resolve(true);
		}

		return this.sandbox.kill().then(() => {
			this.sandbox = null;
			this[update]("active", this[active] = false);

			return true;
		});
	}

	delete() {
		return this.deactivate()
			.then(() => deleteRunner(this))
			.then(() => {
				this.emit("delete");
			});
	}

	static add(runner) {
		return addRunner(runner, runner => new Runner(runner));
	}
}

Runner.store = require("./store");

module.exports = Runner;
