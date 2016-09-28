"use strict";

const owe = require("owe.js");
const { mix, Mixin } = require("mixwith");

const Persistable = require("../../store/Persistable");
const EventEmitter = require("../../events/EventEmitter");
const PromiseQueue = require("../../helpers/PromiseQueue");
const generateLock = require("../../helpers/generateLock");
const filterObject = require("../../helpers/filterObject");

const config = require("../../config");
const { stageManager } = require("../../managers");

const manage = require("../manage");
const integrityCheck = require("../integrityCheck");

const dependentNodes = Symbol("dependentNodes");
const loaded = Symbol("loaded");
const assignLock = Symbol("assignLock");

const Plugin = Mixin(superclass => class Plugin extends mix(superclass).with(Persistable(require("../store")), EventEmitter) {
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

	assign(preset, { stages = {}, checkForUpdates = true } = {}) {
		const res = stageManager(Object.assign({
			setMetadata: () => {
				Object.keys(this).forEach(key => {
					if(key !== "$loki" && key !== "meta" && key !== "persist" && key !== "type")
						delete this[key];
				});

				Object.assign(this, filterObject(preset, [
					"$loki", "meta",
					"name", "displayName", "version", "author", "source", "location", "ports"
				]));

				this.persist();
			},
			validatePlugin: () => {
				console.log(`Assigned plugin '${this.name}' of type '${this.type}'. Autoupdate: ${checkForUpdates}.`);

				if(!checkForUpdates)
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
		}, stages)).then(() => this, err => {
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
});

module.exports = Plugin;
