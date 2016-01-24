"use strict";

const owe = require("owe.js");

const internalize = require("../helpers/internalize");
const persist = require("../helpers/persist");

const Graph = require("../graph/Graph");
const Sandbox = require("./sandbox/Sandbox");
const manager = require("../taskManager");
const helpers = require("./helpers");

const name = Symbol("name");
const enabled = Symbol("enabled");
const active = Symbol("active");
const graph = Symbol("graph");
const update = Symbol("update");
const persistRunner = Symbol("persistRunner");

class Runner extends require("../EventEmitter") {
	constructor() {
		super();
		internalize(this, ["name", "enabled", "active", "graph"]);

		Object.assign(this, {
			[enabled]: true,
			[active]: false,
			[persistRunner]: () => persist(this)
		});

		/* owe binding: */

		const exposed = ["id", "name", "enabled", "active"];

		owe(this, owe.serve({
			router: {
				filter: new Set([...exposed, "graph", "activate", "deactivate", "delete"]),
				writable: new Set(["name"]),
				traversePrototype: true // Allow access to Runner.prototype getters
			},
			closer: {
				filter: true,
				writable: data => typeof data !== "object"
			}
		}));
		owe.expose.properties(this, exposed);
	}

	assign(preset) {
		if(!preset)
			return this;

		Object.assign(this, preset);

		if(!(graph in this))
			this.graph = new Graph({}, this);

		return this;
	}

	[update](type, value) {
		this[persistRunner]();
		this.emit("update");
		this.emit(type, value);
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

	get enabled() {
		return this[enabled];
	}
	set enabled(val) {
		this[val ? "enable" : "disable"]();
	}

	get graph() {
		return this[graph];
	}
	set graph(val) {
		if(this[graph] === val)
			return;

		if(this[graph])
			this[graph].removeListener("update", this[persistRunner]);

		const set = () => {
			this[graph] = val;
			this[graph].on("update", this[persistRunner]);

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

	enable() {
		this[update]("enabled", this[enabled] = true);

		return Promise.resolve(true);
	}

	disable() {
		this[update]("enabled", this[enabled] = false);

		return this.deactivate().then(() => true);
	}

	activate() {
		if(!this[enabled])
			return Promise.reject("This runner is disabled. It cannot be activated.");

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
		return manage.delete(this).then(() => {
			if(this[graph])
				this[graph].removeListener("update", this[persistRunner]);

			this.emit("delete");
		});
	}

	static add(runner) {
		return manage.add(runner);
	}
}

Runner.prototype.activate = manager.taskify(Runner.prototype.activate, function() {
	return this;
}, "activate");

// Necessary to enable persist calls on Runner instances:
Runner.store = require("./store");

module.exports = Runner;

// Import managers after export because of cyclic references between them and Runner:
const manage = require("./manage");
