"use strict";

const owe = require("owe.js");

const manager = require("../manager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	if(plugin.source === "localFile" || plugin.source === "localDirectory")
		return plugin.deactivateDependents()
			.then(() => sources.local(plugin));

	return Promise.reject(new owe.exposed.Error("Invalid update source."));
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin.name, "update");
