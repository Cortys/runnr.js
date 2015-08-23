"use strict";

const fs = require("fs");
const semver = require("semver");
const config = require("../config");
const store = require("./store");
const Plugin = require("./Plugin");

const installationTypes = {
	"local": "local",
	"git": "git",
	"upload": "upload"
};

class Installer {
	constructor(plugin) {
		if(installationTypes[plugin.type] in this)
			this.status = this[installationTypes[plugin.type]](plugin);
		else
			throw new Error("Plugins cannot be installed with the given installation method.");
	}

	local(plugin) {
		const that = this;

		return new Promise(function(resolve, reject) {
			fs.stat(plugin.path, function(err, stat) {
				if(err)
					reject(new Error("Invalid local installation path."));

				if(!stat.isFile())
					reject(new Error("Only files can be installed."));

				fs.readFile(plugin.path, function(err, file) {
					if(err)
						reject(new Error("Plugin file could not be read."));

					resolve(file);
				});
			});
		}).then(function(file) {
			return that.parsePluginFile(file);
		});
	}

	parsePluginFile(file) {
		const startOfManifest = file.indexOf("/*");
		const endOfManifest = file.indexOf("*/\n", startOfManifest);

		const manifest = JSON.parse(file.substring(startOfManifest + 2, endOfManifest));

		this.validateManifest(manifest);

		this.manifest = manifest;

		return file.substring(endOfManifest);
	}

	validateManifest(manifest) {

		if(!manifest.name || typeof manifest.name !== "string")
			throw new TypeError("Plugin name has to be a string.");

		const dbPlugin = store.fineOne(manifest.name);

		if(dbPlugin && (dbPlugin.block || semver.gt(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
			throw new Error(`Plugin with name ${manifest.name} already installed.`);

		store.insert({
			name: manifest.name,
			block: true
		});

		return manifest;
	}
}

module.exports = Installer;
