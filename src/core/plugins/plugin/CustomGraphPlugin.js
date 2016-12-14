"use strict";

const { mixins } = require("@runnr/mixin");
const { internalize } = require("@runnr/helpers");

const abstract = require("./abstract");

class CustomGraphPlugin extends mixins(abstract.GraphPlugin) {
	constructor() {
		super(...arguments);

		this[abstract.Plugin.exposed].publicRoutes.add("graph");
	}

	assign(preset) {
		return super.assign(preset, {
			writableGraph: true,
			setDerivedData: () => {
				// Internalize graph after setMetadata stage because Plugin removes all Object.keys on assign:
				internalize(this, ["graph"]);

				this.graph.assign(preset.graph);
			}
		});
	}
}

module.exports = CustomGraphPlugin;
