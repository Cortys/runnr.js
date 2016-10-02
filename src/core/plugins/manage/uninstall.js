"use strict";

const owe = require("owe.js");
const path = require("path");

const npm = require("../../npm");
const Persistable = require("../../store/Persistable");

const generateLock = require("../../helpers/generateLock");
const manager = require("../../managers").taskManager;

function uninstall(plugin) {
	const lock = generateLock();
	const promise = lock.unlock(plugin.disableDependentRunnersUntil(lock)
		.then(() => {
			if(typeof plugin.location === "string" && !path.isAbsolute(plugin.location))
				return npm.uninstall(plugin.name);
		})
		.then(() => plugin[Persistable.delete](), () => {
			throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
		})
		.then(() => {
			for(const node of plugin.dependentNodes)
				node.delete();

			return true;
		}));

	return promise;
}

module.exports = manager.taskify(uninstall, plugin => plugin, "uninstall");
