"use strict";

const owe = require("owe.js");
const store = require("./store");

const Plugin = require("./Plugin");

let listView;

store.loaded.then(() => listView = store.collection.getDynamicView("list") || store.collection.addDynamicView("list", {
	persistent: false
}).applySimpleSort("displayName"));

const plugins = {
	get list() {
		return listView.mapReduce(plugin => plugin, res => res);
	},

	getByName(pluginName) {
		return store.collection && store.collection.by("name", pluginName);
	},

	getById(pluginId) {
		return store.collection && store.collection.get(pluginId);
	},

	install(plugin) {
		return Plugin.install(plugin);
	}
};

/* Api: */
const pluginsApi = Object.assign(() => plugins.list, {
	install: plugins.install
});

owe(pluginsApi, owe.chain([
	owe.serve({
		router: {
			filter: new Set(["install"])
		}
	}),
	{
		router: plugins.getByName
	}
]));

owe(plugins, owe.reroute(pluginsApi));

module.exports = plugins;
