"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

const installPlugin = require("./manage/install");
const uninstallPlugin = require("./manage/uninstall");

const StoreItem = require("../StoreItem");
const item = StoreItem.dbItem;

class Plugin extends StoreItem {
	constructor(plugin) {

		if(!plugin || typeof plugin !== "object" || !("$loki" in plugin))
			throw new owe.exposed.Error("Plugin not found.");

		super(plugin, function onNewPlugin() {
			this.fs = oweFs({
				root: this.location
			});

			owe(this, owe.serve({
				router: {
					filter: new Set(["id", "name", "version", "author", "source", "uninstall"])
				},
				closer: {
					filter: true
				}
			}));
		});
	}

	get id() {
		return this[item].$loki;
	}

	get name() {
		return this[item].name;
	}

	get version() {
		return this[item].version;
	}

	get author() {
		return this[item].author;
	}

	get source() {
		return this[item].source;
	}

	get location() {
		return this[item].location;
	}

	get copied() {
		return this[item].copied;
	}

	get main() {
		return this[item].main;
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			version: this.version,
			author: this.author,
			source: this.source
		};
	}

	uninstall() {
		return uninstallPlugin(this).then(() => this.delete());
	}

	static install(plugin) {
		return installPlugin(plugin).then(manifest => new Plugin(manifest));
	}
}

module.exports = Plugin;
