"use strict";

const owe = require("owe.js");
const fs = require("fs-extra-promise");

const store = require("../store");

function uninstall(plugin) {
	return (plugin.copied ? fs.removeAsync(plugin.location) : Promise.resolve())
		.then(() => store.collection.remove(plugin), err => {
			if(err && err.code === "ENOENT")
				return store.collection.remove(plugin);

			throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
		});
}

module.exports = uninstall;
