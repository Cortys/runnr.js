"use strict";

const fs = require("fs");
const path = require("path");
const copy = require("cpr");
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
		result.manifest.main = path.basename(plugin.path);

		if(+plugin.copy) {
			return new Promise((resolve, reject) => {
				const location = path.join(config.fromUserData("plugins"), result.manifest.name);

				copy(plugin.path, location, {
					deleteFirst: true,
					overwrite: true,
					confirm: true
				}, err => {
					if(err)
						return reject(new owe.exposed.Error("Plugin files could not be installed."));

					result.manifest.location = location;
					result.manifest.copied = true;

					resolve(result.manifest);
				});
			});
		}

		result.manifest.location = path.dirname(plugin.path);
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

	let manifest = file.substring(startOfManifest + startToken.length, endOfManifest);

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
