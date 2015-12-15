"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const owe = require("owe.js");

const config = require("../../../../config");
const helpers = require("../helpers");

function localFile(plugin) {
	return fs.readFileAsync(plugin.path).catch(() => {
		throw new owe.exposed.Error("Plugin file could not be read.");
	}).then(file => parsePluginFile(file.toString())).then(manifest => {
		if(+plugin.copy) {
			const location = config.fromPlugins(manifest.name);

			return fs.copyAsync(plugin.path, path.join(location, "index.js"), {
				clobber: true
			}).then(() => {
				manifest.location = manifest.name;
				manifest.main = "index.js";

				return fs.writeJsonAsync(path.join(location, "package.json"), manifest);
			}).catch(() => {
				throw new owe.exposed.Error("Plugin file could not be installed.");
			}).then(() => helpers.installDependencies(manifest)).then(() => manifest);
		}

		manifest.location = path.dirname(plugin.path);
		manifest.main = path.basename(plugin.path);
		manifest.source = "local";

		return manifest;
	});
}

function parsePluginFile(file) {
	const startToken = "/**package";
	const endToken = "**/";

	const startOfManifest = file.indexOf(startToken);
	const endOfManifest = file.indexOf(endToken, startOfManifest + startToken.length);

	if(startOfManifest < 0 || endOfManifest < 0
		|| !/\s/.test(file.charAt(startOfManifest + startToken.length))
		|| !/\n|\r/.test(file.charAt(endOfManifest + endToken.length)))
		throw new owe.exposed.SyntaxError("No manifest declaration in the given plugin file.");

	let manifest = file.substring(startOfManifest + startToken.length, endOfManifest).replace(/^\s*\*/mg, "");

	try {
		manifest = JSON.parse(manifest);
	}
	catch(err) {
		throw new owe.exposed.SyntaxError("The manifest in the given plugin file is no valid JSON.");
	}

	return helpers.validateManifest(manifest);
}

module.exports = localFile;
