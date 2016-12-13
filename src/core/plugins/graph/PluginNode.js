"use strict";

const owe = require("owe.js");
const { mixins } = require("@runnr/mixin");
const { UpdateEmitter } = require("@runnr/events");

const { node } = require("../../graph");

const { getById } = require("../get");

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

		this.on("delete", () => this.plugin.deleteDependentNode(this));

		if(this.graph.container instanceof UpdateEmitter)
			this.graph.container.on("delete", () => this.plugin.deleteDependentNode(this));

		this.ready = this.plugin.assigned;

		return this;
	}

	get ports() {
		return this.plugin.ports;
	}
}

module.exports = PluginNode;
