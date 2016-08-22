"use strict";

const owe = require("owe.js");
const { mixins } = require("mixwith");

const Persistable = require("../helpers/Persistable");
const EventEmitter = require("../helpers/EventEmitter");
const PromiseQueue = require("../helpers/PromiseQueue");
const internalize = require("../helpers/internalize");
const generateLock = require("../helpers/generateLock");
const filterObject = require("../helpers/filterObject");

const Graph = require("../graph/Graph");
const GraphContainer = require("../graph/GraphContainer");
const Sandbox = require("./sandbox/Sandbox");
const { taskManager, stageManager } = require("../managers");
const helpers = require("./helpers");

const name = Symbol("name");
const disableQueue = Symbol("disableQueue");
const assigned = Symbol("assigned");
const active = Symbol("active");
const update = Symbol("update");

class Runner extends mixins(Persistable(require("./store")), GraphContainer, EventEmitter) {
	constructor() {
		super();
		internalize(this, ["name", "active", "graph"]);

		Object.assign(this, {
			[assigned]: generateLock(),
			[disableQueue]: new PromiseQueue()
		});

		// Disable activation as long as assign() has not been called on this runner:
		this[disableQueue].add(this[assigned]);

		/* owe binding: */

		const exposed = ["id", "name", "enabled", "active"];

		owe(this, owe.serve({
			router: {
				filter: owe.filter(new Set([...exposed, "graph", "activate", "deactivate", "restart", "delete"])),
				writable: owe.filter(new Set(["name"])),
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

		return stageManager({
			setMetadata: () => {
				Object.assign(this, filterObject(preset, ["$loki", "meta", "name"]));
			},
			assignGraph: () => {
				this.graph = new Graph(this);

				if(preset.graph)
					return this.graph.assign(preset.graph);
			},
			activateRunner: () => this[preset.active ? "activate" : "deactivate"]()
		}).then(() => {
			console.log(`Assigned runner '${this.name}'. Autostart: ${!!preset.active}.`);

			return this;
		}, err => {
			this[disableQueue].add(this[assigned]);

			throw err;
		});
	}

	[update](type, value) {
		this.persist();
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

	get enabled() {
		return this[disableQueue].isEmpty;
	}

	get graph() {
		return super.graph;
	}

	set graph(newGraph) {
		const oldGraph = this.graph;

		super.graph = newGraph;

		if(oldGraph)
			oldGraph.removeListener("update", this.persist);

		newGraph.on("update", this.persist);
		this[update]("graph", oldGraph);
	}

	disableUntil(promise) {
		this[disableQueue].add(promise);

		return this.deactivate();
	}

	activate() {
		if(!this.enabled)
			return Promise.reject(new Error("This runner is disabled. It cannot be activated."));

		if(this[active])
			return Promise.resolve(true);

		// Initial activation sets [active] = true immediately.
		// After this runners graph was loaded and meanwhile no deactivate occured, it is actually activated:
		if(this[active] === undefined) {
			this[active] = true;

			return this.graph.loaded.then(() => {
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

	restart() {
		return this.deactivate().then(() => this.activate());
	}

	delete() {
		return manage.delete(this).then(result => {
			if(this.graph)
				this.graph.removeListener("update", this.persist);

			this.emit("delete");

			return result;
		});
	}

	static add(runner) {
		return manage.add(runner);
	}
}

Runner.prototype.activate = taskManager.taskify(Runner.prototype.activate, function() {
	return this;
}, "activate");

module.exports = Runner;

// Import managers after export because of cyclic references between them and Runner:
const manage = require("./manage");
