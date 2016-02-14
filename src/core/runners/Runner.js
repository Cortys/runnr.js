"use strict";

const owe = require("owe.js");

const internalize = require("../helpers/internalize");
const persist = require("../helpers/persist");

const PromiseQueue = require("../helpers/PromiseQueue");
const Graph = require("../graph/Graph");
const Sandbox = require("./sandbox/Sandbox");
const manager = require("../taskManager");
const helpers = require("./helpers");

const name = Symbol("name");
const disableQueue = Symbol("disableQueue");
const assigned = Symbol("assigned");
const active = Symbol("active");
const graph = Symbol("graph");
const graphLoaded = Symbol("graphLoaded");
const update = Symbol("update");
const persistRunner = Symbol("persistRunner");

class Runner extends require("../EventEmitter") {
	constructor() {
		super();
		internalize(this, ["name", "active", "graph"]);

		Object.assign(this, {
			[assigned]: new Promise(() => {}),
			[disableQueue]: new PromiseQueue(),
			[persistRunner]: () => persist(this)
		});

		// Disable activation as long as assign() has not been called on this runner:
		this[disableQueue].add(this[assigned]);

		this[graphLoaded] = {};
		this[graphLoaded].promise = new Promise(resolve => this[graphLoaded].resolve = resolve);

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

		this[disableQueue].delete(this[assigned]);

		try {
			Object.assign(this, preset);

			if(!("graph" in preset))
				this.graph = new Graph({}, this);

			if(!("active" in preset))
				this.active = false;
		}
		catch(err) {
			this[disableQueue].add(this[assigned]);

			throw err;
		}

		this[assigned] = undefined;

		console.log(`Assigned runner '${this.name}'. Autostart: ${!!preset.active}.`);

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
		return this[disableQueue].isEmpty;
	}

	get graph() {
		return this[graph];
	}
	set graph(val) {
		if(this[graph] === val)
			return;

		// console.log("assigned graph", this.name, val);

		if(this[graph])
			this[graph].removeListener("update", this[persistRunner]);

		const set = () => {
			this[graph] = val;
			this[graph].on("update", this[persistRunner]);
			this[graph].loaded.then(this[graphLoaded].resolve, this[graphLoaded].resolve);

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

	disableUntil(promise) {
		this[disableQueue].add(promise);

		return this.deactivate();
	}

	activate() {
		if(!this.enabled)
			return Promise.reject("This runner is disabled. It cannot be activated.");

		if(this[active])
			return Promise.resolve(true);

		// Initial activation sets [active] = true immediately.
		// After this runners graph was loaded and meanwhile no deactivate occured, it is actually activated:
		if(this[active] === undefined) {
			this[active] = true;

			return this[graphLoaded].promise.then(() => {
				if(this[active] && !this.sandbox)
					this.sandbox = new Sandbox(this);

				return true;
			});
		}

		if(!this[active]) {
			if(!this.sandbox)
				this.sandbox = new Sandbox(this);

			this[update]("active", this[active] = true);
		}

		return Promise.resolve(true);
	}

	deactivate() {
		if(this[active] === undefined) {
			this[active] = false;

			return Promise.resolve(true);
		}

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
		return manage.delete(this).then(result => {
			this.disableUntil(new Promise());

			if(this[graph])
				this[graph].removeListener("update", this[persistRunner]);

			this.emit("delete");

			return result;
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
