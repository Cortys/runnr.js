"use strict";

const owe = require("owe.js");

const store = require("./store");
const { getByName, getById } = require("./get");

const plugin = require("./plugin");

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

	getByName,
	getById,

	install(pluginDescription) {
		return plugin.install(pluginDescription);
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
