"use strict";

const owe = require("owe.js");
const path = require("path");

const npm = require("../../npm");
const store = require("../store");

const manager = require("../../taskManager");

function uninstall(plugin) {
	const promise = plugin.disableDependentRunners(new Promise(resolve => setImmediate(() => resolve(promise))))
		.then(() => {
			if(typeof plugin.location === "string" && !path.isAbsolute(plugin.location))
				return npm.uninstall(plugin.name);
		})
		.then(() => store.collection.remove(plugin), () => {
			throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
		})
		.then(() => {
			for(const node of plugin.dependentNodes)
				node.delete();

			return true;
		});

	return promise;
}

module.exports = manager.taskify(uninstall, plugin => plugin, "uninstall");
