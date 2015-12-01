"use strict";

const sandboxedModule = require("sandboxed-module");

const Node = require("./Node");

class PluginNode extends Node {
	constructor(node) {
		super(node);

		this.plugin = this.api.route("plugin");

		Promise.all([this.plugin.route("mainLocation"), this.loaded]).then(result => {
			const mainLocation = result[0];

			this.sandbox = sandboxedModule.load(mainLocation, {
				globals: {
					runnr: {
						ports: this.ports
					}
				}
			});
		});
	}
}

module.exports = PluginNode;
