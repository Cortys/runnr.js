"use strict";

const owe = require("owe.js");
const path = require("path");
const fs = require("fs-extra-promise");

const config = require("../../config");
const store = require("../store");

const manager = require("./manager");

function uninstall(plugin) {
	return plugin.deactivateDependents().then(() => {
		if(!path.isAbsolute(plugin.location))
			return fs.removeAsync(config.fromPlugins(plugin.location));
	}).then(() => store.collection.remove(plugin), err => {
		if(err && err.code === "ENOENT")
			return store.collection.remove(plugin);

		throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
	}).then(() => {
		for(const node of plugin.dependentNodes)
			node.delete();
	});
}

module.exports = manager.taskify(uninstall, plugin => plugin.name, "uninstall");
