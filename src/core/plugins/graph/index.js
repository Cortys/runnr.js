"use strict";

const { node } = require("../../graph");

module.exports = {
	register() {
		node.registerNodeType("plugin", require("./PluginNode"), require("./PluginNodeExecutor"));
	},

	registerExecutor() {
		node.registerNodeType("plugin", class {}, require("./PluginNodeExecutor"));
	}
};
