"use strict";

const fs = require("fs-extra-promise");
const { mixins } = require("mixwith");

const abstract = require("./abstract");

class GraphPlugin extends mixins(abstract.GraphPlugin, abstract.FsPlugin) {
	assign(preset, validatePlugin) {
		return super.assign(preset, {
			validatePlugin,
			writableGraph: false,
			setDerivedData: () => {
				return this.mainLocation
					.then(mainLocation => fs.readJsonAsync(mainLocation))
					.then(graph => this.graph.assign(graph));
			}
		});
	}
}

module.exports = GraphPlugin;
