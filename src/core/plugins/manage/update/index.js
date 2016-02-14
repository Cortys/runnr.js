"use strict";

const owe = require("owe.js");

const validateEdge = require("../../../graph/helpers/validateEdge");
const manager = require("../../../taskManager");

function update(plugin) {
	if(plugin.source == null)
		return Promise.reject(new owe.exposed.Error("This plugin has no update source."));

	let updater;

	if(plugin.source === "local")
		updater = sources.local;
	else
		return Promise.reject(new owe.exposed.Error("Invalid update source."));

	const activeRunners = new Set();

	const promise = plugin.performOnDependentRunners(runner => {
		if(runner.active)
			activeRunners.add(runner);

		return runner.disableUntil(new Promise(resolve => setImmediate(() => resolve(promise))));
	}).then(() => updater(plugin)).then(() => {
		for(const node of plugin.dependentNodes) {
			let modified = false;

			const edges = node.edges;
			const validate = edge => {
				try {
					validateEdge(edge);
				}
				catch(err) {
					edge.delete();
					modified = true;
				}
			};

			edges.in.forEach(validate);
			edges.out.forEach(validate);

			if(modified && activeRunners.has(node.graph.container))
				activeRunners.delete(node.graph.container);
		}
	});

	return promise.then(() => {
		// Async because this promise.then is executed before the "then" of the dependents disableQueue.
		setImmediate(() => {
			activeRunners.forEach(runner => runner.activate());
		});

		return plugin;
	});
}

const sources = {
	local: require("./local")
};

module.exports = manager.taskify(update, plugin => plugin, "update");
