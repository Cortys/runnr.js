"use strict";

const fs = require("fs-extra-promise");
const { mixins } = require("mixwith");

const Plugin = require("./Plugin");
const { Graph, GraphContainer } = require("../../graph");

class GraphPlugin extends mixins(Plugin, GraphContainer) {
	assign(preset) {
		return super.assign(preset, {
			stages: {
				assignGraph: () => {
					this.graph = new Graph(this, this.source !== "custom");

					if(this.source === "custom")
						return this.graph.assign(preset.graph);

					return this.mainLocation
						.then(mainLocation => fs.readJsonAsync(mainLocation))
						.then(graph => this.graph.assign(graph));
				}
			}
		});
	}
}

module.exports = GraphPlugin;
