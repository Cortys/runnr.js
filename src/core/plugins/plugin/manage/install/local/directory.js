"use strict";

const path = require("path");
const readPackage = require("read-package-json");
const owe = require("owe.js");

function localDirectory(plugin) {
	return new Promise((resolve, reject) => {
		readPackage(path.join(plugin.path, "package.json"), true, (err, data) => {
			if(err)
				reject(err);
			else
				resolve(data);
		});
	}).catch(() => {
		throw new owe.exposed.Error("Plugin declaration was not accepted.");
	});
}

module.exports = localDirectory;
