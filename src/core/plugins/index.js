"use strict";

const owe = require("owe.js");
const store = require("./store");
const Plugin = require("./Plugin");
const install = require("./manage/install");
const uninstall = require("./manage/uninstall");

const listView = store.getDynamicView("list") || store.addDynamicView("list").applySimpleSort("name");

const plugins = {
	get list() {
		return listView.mapReduce(function(plugin) {
			return new Plugin(plugin);
		}, function(res) {
			return res;
		});
	},

	get(pluginName) {
		return new Plugin(store.by("name", pluginName));
	},

	install(plugin) {
		console.log("install attempt", plugin);

		return install(plugin);
	},

	uninstall(plugin) {
		return uninstall(plugin);
	}
};

owe(plugins, owe.serve());

module.exports = plugins;
