"use strict";

const owe = require("owe.js");
const { mixins } = require("mixwith");

const Persistable = require("../store/Persistable");
const UpdateEmitter = require("../events/UpdateEmitter");
const PromiseQueue = require("../helpers/PromiseQueue");
const internalize = require("../helpers/internalize");
const generateLock = require("../helpers/generateLock");
const filterObject = require("../helpers/filterObject");

const { Graph, GraphContainer } = require("../graph");
const Sandbox = require("./sandbox/Sandbox");
const { taskManager, stageManager } = require("../managers");
const helpers = require("./helpers");

const disableQueue = Symbol("disableQueue");
const assigned = Symbol("assigned");

class Runner extends mixins(Persistable(require("./store")), UpdateEmitter(["name", "active"]), GraphContainer) {
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
		return stageManager({
			setMetadata: () => {
				Object.assign(this, filterObject(preset, ["$loki", "meta", "name"]));
			},
			assignGraph: () => {
				this.graph = new Graph(this, true);

				if(preset.graph)
					return this.graph.assign(preset.graph);
			},
			activateRunner: () => {
				this[disableQueue].delete(this[assigned]);

				return this[preset.active ? "activate" : "deactivate"]();
			}
		}).then(() => {
			console.log(`Assigned runner '${this.name}'. Autostart: ${!!preset.active}.`);

			return this;
		}, err => {
			this[disableQueue].add(this[assigned]);

			throw err;
		});
	}

	get id() {
		return this.$loki;
	}

	get name() {
		return super.name;
	}
	set name(val) {
		super.name = helpers.validateName(val, super.name);
	}

	get active() {
		return super.active;
	}

	get enabled() {
		return this[disableQueue].isEmpty;
	}

	disableUntil(promise) {
		this[disableQueue].add(promise);

		return this.deactivate();
	}

	activate() {
		if(!this.enabled)
			return Promise.reject(new Error("This runner is disabled. It cannot be activated."));

		if(this.active)
			return Promise.resolve(true);

		super.active = true;

		return this.graph.loaded.then(() => {
			if(!this.active)
				throw new owe.exposed.Error("The runner was unexpectedly deactivated before it was started.");

			this.sandbox = new Sandbox(this);

			return true;
		});
	}

	deactivate() {
		if(!this.active || !this.sandbox) {
			super.active = false;

			return Promise.resolve(true);
		}

		return this.sandbox.kill().then(() => {
			this.sandbox = null;
			super.active = false;

			return true;
		});
	}

	restart() {
		return this.deactivate().then(() => this.activate());
	}

	delete() {
		return manage.delete(this).then(result => {
			this[UpdateEmitter.delete]();

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
