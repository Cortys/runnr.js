"use strict";

const fs = require("fs-extra-promise");
const { mixins } = require("mixwith");

const Plugin = require("./Plugin");
const { graph, GraphContainer } = require("../../graph");

class GraphPlugin extends mixins(Plugin, GraphContainer) {
	assign(preset) {
		return super.assign(preset, {
			stages: {
				assignGraph: () => {
					this.graph = graph.create(this, this.source === "custom");

					this[Plugin.exposed].privateRoutes.add("graph");

					if(this.source === "custom") {
						this[Plugin.exposed].publicRoutes.add("graph");

						return this.graph.assign(preset.graph);
					}

					this[Plugin.exposed].publicRoutes.delete("graph");

					return this.mainLocation
						.then(mainLocation => fs.readJsonAsync(mainLocation))
						.then(graph => this.graph.assign(graph));
				}
			}
		});
	}
}

module.exports = GraphPlugin;
