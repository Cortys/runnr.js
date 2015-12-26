"use strict";

const path = require("path");

const helpers = require("./helpers");
const install = require("../install");

function updateLocal(plugin) {
	return path.isAbsolute(plugin.location)
		? install({
			type: "local",
			path: plugin.source === "localFile" ? plugin.mainLocation : plugin.location,
			copy: false
		}, manifest => helpers.validateTarget(manifest, plugin, true), true)
		: Promise.resolve();
}

module.exports = updateLocal;
