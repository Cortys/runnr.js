"use strict";

const fs = require("fs-extra");
const path = require("path");
const owe = require("owe.js");

const config = require("../../../../config");
const helpers = require("../helpers");

function localFile(plugin) {
	return new Promise((resolve, reject) => {
		fs.readFile(plugin.path, (err, file) => {
			if(err)
				reject(new owe.exposed.Error("Plugin file could not be read."));

			resolve(file.toString());
		});
	}).then(file => parsePluginFile(file)).then(result => {
		if(+plugin.copy) {
			const location = config.fromUserData("plugins", result.manifest.name);

			return new Promise((resolve, reject) => {
				fs.copy(plugin.path, path.join(location, "index.js"), {
					clobber: true
				}, err => {
					if(err)
						return reject(new owe.exposed.Error("Plugin file could not be installed."));

					resolve();
				});
			}).then(() => {
				result.manifest.location = location;
				result.manifest.main = "index.js";
				result.manifest.copied = true;

				return new Promise((resolve, reject) => {
					fs.writeJSON(path.join(location, "package.json"), result.manifest, err => {
						if(err)
							return reject(new owe.exposed.Error("Plugin file could not be installed."));

						resolve();
					});
				});
			}).then(() => result.manifest);
		}

		result.manifest.location = path.dirname(plugin.path);
		result.manifest.main = path.basename(plugin.path);
		result.manifest.source = "local";

		return result.manifest;
	});
}

function parsePluginFile(file) {
	const startToken = "/**package";
	const endToken = "**/";

	const startOfManifest = file.indexOf(startToken);
	const endOfManifest = file.indexOf(endToken, startOfManifest + startToken.length);

	if(startOfManifest < 0 || endOfManifest < 0 || !/\s/.test(file.charAt(startOfManifest + startToken.length)))
		throw new owe.exposed.SyntaxError("No manifest declaration in the given plugin file.");

	let manifest = file.substring(startOfManifest + startToken.length, endOfManifest).replace(/^\s*\*/mg, "");

	try {
		manifest = JSON.parse(manifest);
	}
	catch(err) {
		throw new owe.exposed.SyntaxError("The manifest in the given plugin file is no valid JSON.");
	}

	return {
		file,
		manifest: helpers.validateManifest(manifest)
	};
}

module.exports = localFile;
