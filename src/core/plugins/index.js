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

	get(pluginName) {
		return store.collection && store.collection.by("name", pluginName);
	},

	install(plugin) {
		return Plugin.install(plugin);
	},

	constraints: require("./manage/constraints")
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
		router: plugins.get
	}
]));

owe(plugins, owe.reroute(pluginsApi));

module.exports = plugins;
