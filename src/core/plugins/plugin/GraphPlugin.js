"use strict";

const fs = require("fs-extra-promise");
const { mixins } = require("mixwith");

const internalize = require("../../helpers/internalize");

const { Plugin } = require("./abstract");
const { graph, GraphContainer } = require("../../graph");

class GraphPlugin extends mixins(Plugin, GraphContainer) {
	assign(preset) {
		return super.assign(preset, {
			setDerivedData: () => {
				this.graph = graph.create(this, this.source === "custom");

				this[Plugin.exposed].privateRoutes.add("graph");

				if(this.source === "custom") {
					this[Plugin.exposed].publicRoutes.add("graph");
					internalize(this, ["graph"]);

					return this.graph.assign(preset.graph);
				}

				return this.mainLocation
					.then(mainLocation => fs.readJsonAsync(mainLocation))
					.then(graph => this.graph.assign(graph));
			}
		});
	}

	get ports() {
		return this.graph.ports;
	}
}

module.exports = GraphPlugin;
