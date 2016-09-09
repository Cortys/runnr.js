"use strict";

const fs = require("fs-extra-promise");
const owe = require("owe.js");

function localFile(plugin) {
	return fs.readFileAsync(plugin.path).catch(() => {
		throw new owe.exposed.Error("Plugin file could not be read.");
	}).then(file => parsePluginFile(file.toString()));
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

	return manifest;
}

module.exports = localFile;
