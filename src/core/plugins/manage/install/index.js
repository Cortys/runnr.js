"use strict";

const owe = require("owe.js");
const { generateLock } = require("@runnr/helpers");

const validateEdge = require("../../../graph/helpers/validateEdge");
const Persistable = require("../../../store/Persistable");
const manager = require("../../../managers").taskManager;
const helpers = require("./helpers");

function install(installRequest, getTarget = helpers.getTarget, dontManage = false) {
	if(typeof installRequest !== "object" || !installRequest)
		return Promise.reject(new owe.exposed.TypeError(`Given plugin '${installRequest}' cannot be installed.`));

	if(!(installRequest.mode in installationModes))
		return Promise.reject(new owe.exposed.Error("Plugins cannot be installed with the given installation method."));

	/**
	 * The plugin instance affected/created by this installation.
	 * @type Plugin
	 */
	let target;

	const activeRunners = new Set();
	const lock = generateLock();
	const delayer = manifest => {
		target = getTarget(helpers.validateManifest(manifest));

		return (dontManage ? Promise.resolve() : manager.delay(
			target,
			lock,
			"install"
		)).then(() => {
			// After target Plugin was found: Disable all its dependent runners.
			return target.performOnDependentRunners(runner => {
				if(runner.active)
					activeRunners.add(runner);

				return runner.disableUntil(lock);
			});
		}).then(() => manifest);
	};

	return lock.unlock(installationModes[installRequest.mode](installRequest, delayer)
		.then(manifest => target.assign(manifest, false))
		.catch(err => {
			// If target was newly created by getTarget, destroy it if installation failed:
			if(target && !target.isAssigned)
				target[Persistable.delete]();

			throw err;
		})
		.then(() => {
			// Remove all graph edges of dependent nodes that are invalid after the installation:
			for(const node of target.dependentNodes) {
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
		}))
		.then(() => {
			// Reactivate all runners that were not affected by this installation:
			// Async because this "then" is executed before the "then" of the dependents disableQueue.
			setImmediate(() => {
				activeRunners.forEach(runner => runner.activate());
			});

			return target;
		});
}

const installationModes = {
	__proto__: null,

	local: require("./local"),
	custom: require("./custom")
};

module.exports = install;
