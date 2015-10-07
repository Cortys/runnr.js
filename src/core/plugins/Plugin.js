"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");
const StoreItem = require("../StoreItem");

const installPlugin = require("./manage/install");
const uninstallPlugin = require("./manage/uninstall");

class Plugin extends StoreItem {
	constructor(preset) {

		const exposed = ["name", "displayName", "version", "author", "source"];

		super(exposed, undefined, preset);

		this.fs = oweFs({
			root: this.location
		});

		owe(this, owe.serve({
			router: {
				filter: new Set(exposed.concat(["uninstall"])),
				deep: true
			},
			closer: {
				filter: true
			}
		}));
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
