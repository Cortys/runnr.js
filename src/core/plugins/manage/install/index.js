"use strict";

const owe = require("owe.js");

const helpers = require("./helpers");

function install(plugin, map) {
	if(typeof plugin !== "object" || !plugin)
		throw new owe.exposed.TypeError(`Given plugin '${plugin}' cannot be installed.`);

	if(plugin.type in installationTypes)
		return installationTypes[plugin.type](plugin)
			.then(manifest => helpers.installManifest(map(manifest)));
	else
		throw new owe.exposed.Error("Plugins cannot be installed with the given installation method.");
}

const installationTypes = {
	__proto__: null,

	local: require("./local")
};

module.exports = install;
