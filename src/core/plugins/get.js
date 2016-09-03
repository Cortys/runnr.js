"use strict";

const store = require("./store");

module.exports = {
	getByName(pluginName) {
		if(!store.collection)
			throw new Error("Plugin store not loaded yet.");

		return store.collection.by("name", pluginName);
	},

	getById(pluginId) {
		if(!store.collection)
			throw new Error("Plugin store not loaded yet.");

		return store.collection.get(pluginId);
	}
};
