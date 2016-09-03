"use strict";

const owe = require("owe.js");
const { mixins } = require("mixwith");

const { getById } = require("../get");

const { node } = require("../../graph");

const Node = node.Node({
	pluginId: {
		exposed: true
	},
	plugin: {}
});

class PluginNode extends mixins(Node) {
	assign(preset, parentGraph) {
		super.assign(preset, parentGraph);

		this.pluginId = preset.pluginId;

		Object.defineProperty(this, "plugin", {
			enumerable: false,
			configurable: true,
			value: getById(this.pluginId)
		});

		if(!this.plugin)
			throw new owe.exposed.Error(`There is no plugin with the name '${this.name}'.`);

		this.plugin.addDependentNode(this);

		this.loaded = this.plugin.loaded;

		return this;
	}

	get ports() {
		return this.plugin.ports;
	}
}

node.registerNodeType("plugin", PluginNode);

module.exports = PluginNode;
