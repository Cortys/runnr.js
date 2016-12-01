"use strict";

const { mixins } = require("@runnr/mixin");

const { NodeExecutor } = require("../../graph").node;

const { execute } = require("./executor");

class PluginNodeExecutor extends mixins(NodeExecutor) {
	assign(preset, parentGraph) {
		return super.assign(preset, parentGraph).then(() => {
			this.plugin = this.api.plugin;

			return execute(this);
		});
	}
}

module.exports = PluginNodeExecutor;
