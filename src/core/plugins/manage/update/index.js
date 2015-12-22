"use strict";

const manager = require("../manager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.resolve(false);

	if(plugin.source === "local")
		return sources.local(plugin);
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin.name, "update");
