"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const owe = require("owe.js");

const npm = require("../../../../npm");

const localFile = require("./file");
const localDirectory = require("./directory");

function local(installRequest, validateManifest) {
	if(typeof installRequest.path === "string")
		installRequest.path = path.normalize(installRequest.path);

	return fs.isDirectoryAsync(installRequest.path)
		.then(dir => {
			return (dir ? localDirectory : localFile)(installRequest);
		}, () => new owe.exposed.Error("Invalid local installation path."))
		.then(validateManifest)
		.then(manifest => {
			if(+installRequest.copy) {
				manifest.location = manifest.name;

				return npm.install(installRequest.path).then(() => manifest);
			}

			manifest.location = installRequest.path;
			manifest.source = "local";

			return manifest;
		});
}

module.exports = local;
