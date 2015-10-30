"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");
const StoreItem = require("../StoreItem");
const path = require("path");

const installPlugin = require("./manage/install");
const uninstallPlugin = require("./manage/uninstall");

class Plugin extends StoreItem {
	constructor(preset) {
		super(preset);

		this.fs = oweFs({
			root: this.location
		});

		/* owe binding: */

		const exposed = ["name", "displayName", "version", "author", "source"];

		owe(this, owe.serve({
			router: {
				filter: owe.switch(function() {
					return this.origin.sandbox ? "private" : "public";
				}, {
					public: new Set([...exposed, "uninstall"]),
					private: new Set([...exposed, "location", "main", "mainLocation", "uninstall"])
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
			.then(() => this.emit("uninstalled"));
	}

	static install(plugin) {
		return installPlugin(plugin, manifest => new Plugin(manifest));
	}
}

module.exports = Plugin;
