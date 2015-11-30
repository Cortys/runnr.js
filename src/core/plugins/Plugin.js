"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");
const path = require("path");

const installPlugin = require("./manage/install");
const uninstallPlugin = require("./manage/uninstall");

class Plugin extends require("events") {
	constructor(preset) {
		super();
		Object.assign(this, preset);

		this.fs = oweFs({
			root: this.location
		});

		/* owe binding: */

		const exposed = ["name", "displayName", "version", "author", "source"];
		const publicRoutes = new Set([...exposed, "ports", "uninstall"]);
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
					deep: true
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
		return path.join(this.location, this.main);
	}

	uninstall() {
		return uninstallPlugin(this)
			.then(() => this.emit("uninstall"));
	}

	static install(plugin) {
		return installPlugin(plugin, manifest => new Plugin(manifest));
	}
}

module.exports = Plugin;
