"use strict";

const owe = require("owe.js");

const manager = require("../manager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.resolve(false);

	if(plugin.source === "localFile" || plugin.source === "localDirectory")
		return sources.local(plugin);

	return Promise.reject(new owe.exposed.Error("Invalid update source."));
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin.name, "update");
