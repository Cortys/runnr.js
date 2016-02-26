"use strict";

const owe = require("owe.js");

const config = require("../config");
const persist = require("../helpers/persist");
const filterObject = require("../helpers/filterObject");

const integrityCheck = require("./integrityCheck");

const dependentNodes = Symbol("dependentNodes");
const loaded = Symbol("loaded");

class Plugin extends require("../EventEmitter") {
	constructor() {
		super();
		this[dependentNodes] = new Set();
		this[loaded] = {};
		this[loaded].promise = new Promise((resolve, reject) => Object.assign(this[loaded], {
			resolve, reject
		}));

		this[loaded].promise.then(() => console.log(`Loaded plugin '${this.name}'.`));

		/* owe binding: */

		const exposed = ["id", "type", "name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposed, "ports", "dependents", "update", "uninstall"]);
		const privateRoutes = new Set([...publicRoutes, "location", "mainLocation", "graph"]);

		const that = this;

		owe(this, owe.serve({
			router: {
				filter: owe.switch(function() {
					if(this.value !== that)
						return "deep";

					return this.origin.sandbox ? "private" : "public";
				}, {
					public: publicRoutes,
					private: privateRoutes,
					deep(route) {
						return this.value.hasOwnProperty(route);
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

		Object.keys(this).forEach(key => {
			if(key !== "$loki" && key !== "meta")
				delete this[key];
		});

		if(preset.type !== "js" && preset.type !== "graph")
			preset.type = "js";

		Object.assign(this, filterObject(preset, [
			"$loki", "meta",
			"type", "name", "displayName", "version", "author", "source", "location", "ports", "graph"
		]));

		if(!dontCheck)
			// Uninstall plugin if it was removed from fs, update otherwise:
			// Performed async to ensure, that all Plugins and Runners were initialized.
			// Runners can then be safely disabled during plugin update or uninstall.
			setImmediate(() => {
				integrityCheck(this)
					.then(() => this.source && this.update(), err => {
						console.error(`Plugin '${this.name}' is faulty and will be uninstalled.`, err);

						return this.uninstall();
					})
					.then(() => true).then(this[loaded].resolve, this[loaded].reject);
			});
		else
			this[loaded].resolve(true);

		persist(this);

		console.log(`Assigned plugin '${this.name}'. Autoupdate: ${!dontCheck}.`);

		return this;
	}

	get loaded() {
		return this[loaded].promise;
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

	disableDependentRunners(promise) {
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

// Necessary to enable persist calls on Plugin instances:
Plugin.store = require("./store");

module.exports = Plugin;

// Import managers after export because of cyclic references between them and Plugin:
const manage = require("./manage");
