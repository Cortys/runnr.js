"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const owe = require("owe.js");

const npm = require("../../../../npm");

const localFile = require("./file");
const localDirectory = require("./directory");

function local(plugin, delayer) {
	if(typeof plugin.path === "string")
		plugin.path = path.normalize(plugin.path);

	return fs.isDirectoryAsync(plugin.path)
		.then(dir => {
			return (dir ? localDirectory : localFile)(plugin);
		}, () => new owe.exposed.Error("Invalid local installation path."))
		.then(delayer)
		.then(manifest => {
			if(+plugin.copy) {
				manifest.location = manifest.name;

				return npm.install(plugin.path).then(() => manifest);
			}

			manifest.location = plugin.path;
			manifest.source = "local";

			return manifest;
		});
}

module.exports = local;
