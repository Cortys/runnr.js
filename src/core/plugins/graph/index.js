"use strict";

const { node } = require("../../graph");

module.exports = {
	register() {
		node.registerNodeType("plugin", {
			Model: require("./PluginNode"),
			Executor: require("./PluginNodeExecutor")
		});
	},

	registerExecutor() {
		node.registerNodeType("plugin", {
			Model: class {},
			Executor: require("./PluginNodeExecutor")
		});
	}
};
