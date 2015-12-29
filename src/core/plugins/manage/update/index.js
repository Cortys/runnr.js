"use strict";

const owe = require("owe.js");

const validateEdge = require("../../../graph/helpers/validateEdge")
const manager = require("../manager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	if(plugin.source === "localFile" || plugin.source === "localDirectory")
		return plugin.deactivateDependents()
			.then(() => sources.local(plugin))
			.then(() => {
				for(const node of plugin.dependentNodes) {
					const edges = node.edges;
					const validate = edge => {
						try {
							validateEdge(edge);
						}
						catch(err) {
							edge.delete();
						}
					};

					edges.in.forEach(validate);
					edges.out.forEach(validate);
				}
			});

	return Promise.reject(new owe.exposed.Error("Invalid update source."));
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin.name, "update");
