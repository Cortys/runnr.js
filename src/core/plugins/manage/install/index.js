"use strict";

const owe = require("owe.js");

const manager = require("../manager");
const helpers = require("./helpers");

function install(plugin, getTarget, dontManage) {
	if(typeof plugin !== "object" || !plugin)
		return Promise.reject(new owe.exposed.TypeError(`Given plugin '${plugin}' cannot be installed.`));

	if(plugin.type in installationTypes) {
		const delayer = dontManage ? manifest => Promise.resolve(manifest) : manifest => manager.delay(
			manifest.name,
			new Promise(resolve => setImmediate(() => resolve(promise))),
			"install"
		);

		if(typeof getTarget !== "function")
			getTarget = helpers.getTarget;

		let target;

		const validator = manifest => delayer(manifest).then(() => {
			target = getTarget(manifest);

			return manifest;
		});

		const promise = installationTypes[plugin.type](plugin, validator)
			.then(manifest => helpers.installManifest(target.assign(manifest, true)));

		return promise;
	}
	else
		return Promise.reject(new owe.exposed.Error("Plugins cannot be installed with the given installation method."));
}

const installationTypes = {
	__proto__: null,

	local: require("./local")
};

module.exports = install;
