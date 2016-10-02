"use strict";

const owe = require("owe.js");

const manager = require("../../../managers").taskManager;

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	if(plugin.source in sources)
		return sources[plugin.source](plugin);

	return Promise.reject(new owe.exposed.Error("Invalid update source."));
}

const sources = {
	__proto__: null,

	local: require("./local"),
	custom: () => {
		throw new owe.exposed.Error("Custom plugins do not have update sources.");
	}
};

module.exports = manager.taskify(update, plugin => plugin, "update");
