"use strict";

const path = require("path");

const install = require("../install");

function updateLocal(plugin) {
	return path.isAbsolute(plugin.location)
		? install({
			type: "local",
			path: plugin.source === "localFile" ? plugin.mainLocation : plugin.location,
			copy: false
		}, manifest => plugin.assign(manifest), true)
		: Promise.resolve();
}

module.exports = updateLocal;
