"use strict";

const owe = require("owe.js");

const validateEdge = require("../../../graph/helpers/validateEdge");
const manager = require("../../../taskManager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	let updater;

	if(plugin.source === "localFile" || plugin.source === "localDirectory")
		updater = sources.local;
	else
		return Promise.reject(new owe.exposed.Error("Invalid update source."));

	return plugin.deactivateDependents()
		.then(() => updater(plugin))
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
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin, "update");
