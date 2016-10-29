"use strict";

const { mix, Mixin } = require("mixwith");

const Plugin = require("./Plugin");
const { graph, GraphContainer } = require("../../../graph");

const GraphPlugin = Mixin(superclass => class GraphPlugin extends mix(superclass).with(Plugin, GraphContainer) {
	constructor() {
		super(...arguments);

		this[Plugin.exposed].privateRoutes.add("graph");
	}

	assign(preset, stages = {}) {
		return super.assign(preset, Object.assign({}, stages, {
			setDerivedData: () => {
				this.graph = graph.create(this, stages.writableGraph);

				if(typeof stages.setDerivedData === "function")
					return stages.setDerivedData();
			}
		}));
	}

	get ports() {
		return this.graph.ports;
	}
});

module.exports = GraphPlugin;
