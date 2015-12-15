"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

const config = require("../config");

const installPlugin = require("./manage/install");
const uninstallPlugin = require("./manage/uninstall");

const dependentNodes = Symbol("dependentNodes");

class Plugin extends require("../EventEmitter") {
	constructor(preset) {
		super();
		Object.assign(this, preset);

		this.fs = oweFs({
			root: this.location
		});

		this[dependentNodes] = new Set();

		/* owe binding: */

		const exposed = ["name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposed, "ports", "dependents", "uninstall"]);
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

	addDependentNode(node) {
		this[dependentNodes].add(node);

		node.once("delete", () => this[dependentNodes].delete(node));
	}

	uninstall() {
		return Promise.all(this.dependents.runners.map(runner => runner.deactivate()))
			.then(() => uninstallPlugin(this))
			.then(() => {
				this[dependentNodes].forEach(node => node.delete());
				this.emit("uninstall");
			});
	}

	static install(plugin) {
		return installPlugin(plugin, manifest => new Plugin(manifest));
	}
}

Plugin.store = require("./store");

module.exports = Plugin;
