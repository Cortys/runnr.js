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

		console.log("get");

		const res = store.by("name", pluginName);

		console.log("get", pluginName, res);

		return new Plugin(res);
	},

	install(plugin) {
		return install(plugin);
	}
};

/* Api: */
const pluginsApi = function() {
	return plugins.list;
};

pluginsApi.install = plugins.install;

owe(pluginsApi, owe.chain([
	owe.serve({
		router: {
			filter: new Set(["install"])
		}
	}),
	owe.reroute(owe(null, plugins.get, function() {
		throw undefined;
	}))
], {
	errors(errs) {
		console.log(errs);

		return errs[errs.length - 1];
	},
	removeNonErrors: true
}));

owe(plugins, owe.reroute(pluginsApi));

module.exports = plugins;
