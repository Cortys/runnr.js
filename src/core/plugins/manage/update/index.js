"use strict";

const owe = require("owe.js");

const manager = require("../../../managers").taskManager;

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	let updater;

	if(plugin.source === "local")
		updater = sources.local;
	else
		return Promise.reject(new owe.exposed.Error("Invalid update source."));

	return updater(plugin);
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin, "update");
