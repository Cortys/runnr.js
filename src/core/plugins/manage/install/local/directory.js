"use strict";

const path = require("path");
const readPackage = require("read-package-json");
const owe = require("owe.js");

function localDirectory(installRequest) {
	return new Promise((resolve, reject) => {
		readPackage(path.join(installRequest.path, "package.json"), true, (err, data) => {
			if(err)
				reject(err);
			else
				resolve(data);
		});
	}).catch(() => {
		throw new owe.exposed.Error("Plugin declaration was either not found or invalid.");
	});
}

module.exports = localDirectory;
