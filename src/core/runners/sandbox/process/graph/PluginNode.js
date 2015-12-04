"use strict";

const sandboxedModule = require("sandboxed-module");

const Node = require("./Node");
const SandboxHandle = require("./SandboxHandle");

class PluginNode extends Node {
	constructor(preset, parentGraph) {
		super(preset, parentGraph);

		this.plugin = this.api.route("plugin");

		Promise.all([this.plugin.route("mainLocation"), this.loaded]).then(result => {
			const mainLocation = result[0];

			this.sandbox = sandboxedModule.load(mainLocation, {
				globals: {
					runnr: new SandboxHandle(this)
				}
			});
		});
	}
}

module.exports = PluginNode;
