"use strict";

const fs = require("fs-extra-promise");
const owe = require("owe.js");
const { mixins } = require("mixwith");

const Persistable = require("../helpers/Persistable");
const EventEmitter = require("../helpers/EventEmitter");
const PromiseQueue = require("../helpers/PromiseQueue");
const generateLock = require("../helpers/generateLock");
const filterObject = require("../helpers/filterObject");

const GraphContainer = require("../graph/GraphContainer");
const config = require("../config");
const { stageManager } = require("../managers");

const integrityCheck = require("./integrityCheck");

const dependentNodes = Symbol("dependentNodes");
const loaded = Symbol("loaded");
const assignLock = Symbol("assignLock");

class Plugin extends mixins(Persistable(require("./store")), GraphContainer, EventEmitter) {
	constructor() {
		super();
		this[dependentNodes] = new Set();
		this[loaded] = new PromiseQueue();
		this[assignLock] = generateLock();

		this[loaded].add(this[assignLock]);
		this.loaded.then(() => console.log(`Loaded plugin '${this.name}'.`));

		/* owe binding: */

		const exposed = ["id", "type", "name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposed, "ports", "dependents", "update", "uninstall"]);
		const privateRoutes = new Set([...publicRoutes, "location", "mainLocation", "graph"]);

		owe(this, owe.serve({
			router: {
				filter: owe.switch((destination, state) => {
					if(state.value !== this)
						return "deep";

					return state.origin.sandbox ? "private" : "public";
				}, {
					public: owe.filter(publicRoutes),
					private: owe.filter(privateRoutes),
					deep(destination, state) {
						return state.value.hasOwnProperty(destination);
					}
				}),
				deep: true,
				traversePrototype: true // Allow access to Plugin.prototype getters
			},
			closer: {
				filter: true
			}
		}));
		owe.expose.properties(this, exposed);
	}

	assign(preset, dontCheck) {
		if(!preset)
			return this;

		const res = stageManager({
			setMetadata: () => {
				Object.keys(this).forEach(key => {
					if(key !== "$loki" && key !== "meta" && key !== "persist")
						delete this[key];
				});

				if(preset.type !== "js" && preset.type !== "graph")
					preset.type = "js";

				Object.assign(this, filterObject(preset, [
					"$loki", "meta",
					"type", "name", "displayName", "version", "author", "source", "location", "ports"
				]));

				this.persist();
			},
			assignGraph: () => {
				if(this.type !== "graph")
					return;

				this.graph = new Graph(this);

				if(this.source === "custom")
					return this.graph.assign(preset.graph);

				return this.mainLocation
					.then(mainLocation => fs.readJsonAsync(mainLocation))
					.then(graph => this.graph.assign(graph));
			},
			validatePlugin: () => {
				console.log(`Assigned plugin '${this.name}'. Autoupdate: ${!dontCheck}.`);

				if(dontCheck)
					throw Object.assign(new Error("Validation was disabled for this plugin assign."), {
						noValidation: true
					});

				// Uninstall plugin if it was removed from fs, update otherwise:
				return integrityCheck(this).then(() => {
					if(this.source)
						return this.update();
				}, err => {
					console.error(`Plugin '${this.name}' is faulty and will be uninstalled.`, err);

					return this.uninstall();
				});
			}
		}).then(() => this, err => {
			if(!err.noValidation)
				throw err;

			return this;
		});

		this[loaded].add(res);
		this[assignLock].unlock();

		return res;
	}

	get loaded() {
		return this[loaded].onEmpty;
	}

	get id() {
		return this.$loki;
	}

	get mainLocation() {
		return config.fromPlugins(this.location);
	}

	get dependents() {
		const result = {
			plugins: new Set(),
			runners: new Set()
		};

		this[dependentNodes].forEach(node => {
			result[node.graph.container instanceof Plugin
				? "plugins"
				: "runners"].add(node.graph.container);
		});

		return {
			plugins: [...result.plugins],
			runners: [...result.runners]
		};
	}

	get dependentNodes() {
		return this[dependentNodes].values();
	}

	addDependentNode(node) {
		this[dependentNodes].add(node);

		node.once("delete", () => this[dependentNodes].delete(node));
	}

	performOnDependentRunners(method) {
		return Promise.all(this.dependents.runners.map(method));
	}

	disableDependentRunnersUntil(promise) {
		return this.performOnDependentRunners(runner => runner.disableUntil(promise));
	}

	uninstall() {
		return manage.uninstall(this).then(result => {
			this.emit("uninstall");

			return result;
		});
	}

	update() {
		return manage.update(this);
	}

	static install(plugin) {
		return manage.install(plugin);
	}
}

module.exports = Plugin;

// Import managers after export because of cyclic references between them and Plugin:
const manage = require("./manage");
const Graph = require("../graph/Graph");
