"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

const install = require("./manage/install");
const uninstall = require("./manage/uninstall");

const StoreItem = require("../StoreItem");
const dbPlugin = StoreItem.dbItem;

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
		return this[dbPlugin].$loki;
	}

	get name() {
		return this[dbPlugin].name;
	}

	get version() {
		return this[dbPlugin].version;
	}

	get author() {
		return this[dbPlugin].author;
	}

	get source() {
		return this[dbPlugin].source;
	}

	get location() {
		return this[dbPlugin].location;
	}

	get copied() {
		return this[dbPlugin].copied;
	}

	get main() {
		return this[dbPlugin].main;
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
		return uninstall(this).then(() => StoreItem.delete(this[dbPlugin]));
	}

	static install(plugin) {
		return install(plugin);
	}
}

module.exports = Plugin;
