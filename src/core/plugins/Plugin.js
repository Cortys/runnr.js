"use strict";

const owe = require("owe.js");

const config = require("../config");

const installPlugin = require("./manage/install");
const updatePlugin = require("./manage/update");
const uninstallPlugin = require("./manage/uninstall");
const integrityCheck = require("./manage/integrityCheck");

const dependentNodes = Symbol("dependentNodes");

class Plugin extends require("../EventEmitter") {
	constructor(preset) {
		super();
		this[dependentNodes] = new Set();

		this.assign(preset);

		/* owe binding: */

		const exposed = ["id", "name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposed, "ports", "dependents", "update", "uninstall"]);
		const privateRoutes = new Set([...publicRoutes, "location", "main", "mainLocation"]);

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
				deep: true
			},
			closer: {
				filter: true
			}
		}));
		owe.expose.properties(this, exposed);
	}

	assign(preset) {
		if(!preset)
			return;

		Object.keys(this).forEach(key => {
			if(key !== "$loki")
				delete this[key];
		});

		Object.assign(this, preset);

		// Uninstall plugin if it was removed from fs, update otherwise:
		integrityCheck(this).then(() => this.update(), () => this.uninstall());
	}

	get id() {
		return this.$loki;
	}

	get mainLocation() {
		return config.fromPlugins(this.location, this.main);
	}

	get dependents() {
		const result = {
			plugins: new Set(),
			runners: new Set()
		};

		this[dependentNodes].forEach(node => {
			return result[node.graph.container instanceof Plugin ? "plugins" : "runners"]
				.add(node.graph.container);
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

	deactivateDependents() {
		return Promise.all(this.dependents.runners.map(runner => runner.deactivate()));
	}

	update() {
		return updatePlugin(this);
	}

	uninstall() {
		return uninstallPlugin(this).then(() => {
			this.emit("uninstall");
		});
	}

	static install(plugin) {
		return installPlugin(plugin, manifest => new Plugin(manifest));
	}
}

Plugin.store = require("./store");

module.exports = Plugin;
