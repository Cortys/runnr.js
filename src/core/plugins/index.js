"use strict";

const owe = require("owe.js");
const store = require("./store");

const Plugin = require("./Plugin");

let listView;

store.loaded.then(() => listView = store.collection.getDynamicView("list") || store.collection.addDynamicView("list", {
	persistent: false
}).applyFind({
	type: {
		$in: ["js", "graph"]
	}
}).applySimpleSort("displayName"));

const plugins = {
	get list() {
		return listView.data();
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
	install: plugins.install,
	byName: owe(null, plugins.getByName)
});

owe(pluginsApi, owe.chain([
	owe.serve({
		router: {
			filter: owe.filter(new Set(["install", "byName"]))
		}
	}), {
		router: plugins.getById
	}
]));

owe(plugins, owe.reroute(pluginsApi));

module.exports = plugins;
