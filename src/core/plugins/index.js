"use strict";

const owe = require("owe.js");
const store = require("./store");
const Plugin = require("./Plugin");

const listView = store.addDynamicView("list").applySimpleSort("name");

const plugins = {
	get list() {
		return listView.mapReduce(function(plugin) {

			return new Plugin(plugin);
		}, function(res) {
			return res;
		});
	}
};

owe(plugins, owe.serve());

module.exports = plugins;
