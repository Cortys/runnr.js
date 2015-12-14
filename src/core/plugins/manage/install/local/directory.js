"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const readPackage = require("read-package-json");
const owe = require("owe.js");

const config = require("../../../../config");
const helpers = require("../helpers");

function localDirectory(plugin) {
	return new Promise((resolve, reject) => {
		readPackage(path.join(plugin.path, "package.json"), true, (err, data) => {
			if(err)
				reject(err);

			resolve(data);
		});
	}).then(helpers.validateManifest, () => {
		throw new owe.exposed.Error("Plugin declaration was not accepted.");
	}).then(manifest => {
		if(+plugin.copy) {
			const location = config.fromPlugins(manifest.name);

			return fs.copyAsync(plugin.path, location, {
				clobber: true
			}).then(() => {
				if(!("main" in manifest))
					manifest.main = "index.js";

				manifest.location = manifest.name;

				return fs.writeJsonAsync(path.join(location, "package.json"), manifest);
			}).then(() => manifest, () => {
				throw new owe.exposed.Error("Plugin file could not be installed.");
			});
		}

		if(!("main" in manifest))
			manifest.main = "index.js";

		manifest.location = plugin.path;

		return manifest;
	});
}

module.exports = localDirectory;
