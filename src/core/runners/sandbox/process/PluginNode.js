"use strict";

const sandboxedModule = require("sandboxed-module");

const Node = require("./Node");

class PluginNode extends Node {
	constructor(node) {
		super(node);

		this.plugin = this.api.route("plugin");

		Promise.all([this.loaded, this.plugin.route("mainLocation")])
			.then(mainLocation => this.sandbox = sandboxedModule.load(mainLocation[1], {
				globals: {
					runnr: {
						test: "test"
					}
				}
			}));
	}
}

module.exports = PluginNode;
