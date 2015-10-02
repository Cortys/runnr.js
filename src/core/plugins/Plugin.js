"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

class Plugin extends require("events") {
	constructor(preset) {

		super();

		if(preset && typeof preset === "object")
			Object.assign(this, preset);

		this.fs = oweFs({
			root: this.location
		});

		owe(this, owe.serve({
			router: {
				filter: new Set(["name", "displayName", "version", "author", "source", "uninstall"]),
				deep: true
			},
			closer: {
				filter: true
			}
		}));

		owe.expose(this, () => this.exposed);
	}

	/* Exposed properties: */

	get exposed() {
		return {
			name: this.name,
			displayName: this.displayName,
			version: this.version,
			author: this.author,
			source: this.source
		};
	}

	/* Methods: */

	uninstall() {
		return require("./manage/uninstall")(this)
			.then(() => this.emit("uninstalled"));
	}

	static install(plugin) {
		return require("./manage/install")(plugin, manifest => new Plugin(manifest));
	}
}

module.exports = Plugin;
