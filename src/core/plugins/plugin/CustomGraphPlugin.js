"use strict";

const { mixins } = require("mixwith");

const internalize = require("../../helpers/internalize");

const abstract = require("./abstract");

class GraphPlugin extends mixins(abstract.GraphPlugin) {
	constructor() {
		super(...arguments);
		internalize(this, ["graph"]);

		this[abstract.Plugin.exposed].publicRoutes.add("graph");
	}

	assign(preset) {
		return super.assign(preset, {
			writableGraph: true,
			setDerivedData: () => this.graph.assign(preset.graph)
		});
	}
}

module.exports = GraphPlugin;
