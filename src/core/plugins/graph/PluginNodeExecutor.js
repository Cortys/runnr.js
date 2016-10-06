"use strict";

const { mixins } = require("mixwith");
const sandboxedModule = require("sandboxed-module");

const { NodeExecutor } = require("../../graph").node;

const SandboxHandle = require("./SandboxHandle");

class PluginNodeExecutor extends mixins(NodeExecutor) {
	assign(preset, parentGraph) {
		super.assign(preset, parentGraph);

		this.plugin = this.api.plugin;

		Promise.all([this.plugin.mainLocation, this.loaded]).then(([mainLocation]) => {
			this.sandbox = sandboxedModule.load(mainLocation, {
				globals: {
					runnr: new SandboxHandle(this)
				}
			});
		});

		return this;
	}
}

module.exports = PluginNodeExecutor;
