"use strict";

const owe = require("owe.js");
const path = require("path");
const fs = require("fs-extra-promise");

const config = require("../../config");
const store = require("../store");

function uninstall(plugin) {
	return (path.isAbsolute(plugin.location)
		? Promise.resolve()
		: fs.removeAsync(config.fromPlugins(plugin.location)))
		.then(() => store.collection.remove(plugin), err => {
			if(err && err.code === "ENOENT")
				return store.collection.remove(plugin);

			throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
		});
}

module.exports = uninstall;
