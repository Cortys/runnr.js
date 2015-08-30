"use strict";

const fs = require("fs");
const path = require("path");
const copy = require("cpr");
const semver = require("semver");
const config = require("../../config");
const store = require("../store");
const Plugin = require("../Plugin");

function install(plugin) {
	if(helpers.installationTypes[plugin.type] in helpers)
		return helpers[helpers.installationTypes[plugin.type]](plugin);
	else
		throw new Error("Plugins cannot be installed with the given installation method.");
}

const helpers = {
	installationTypes: {

		__proto__: null,

		"local": "local",
		"git": "git",
		"upload": "upload"
	},

	/* Installation Types: */

	local(plugin) {

		return new Promise(function(resolve, reject) {
			fs.stat(plugin.path, function(err, stat) {
				if(err)
					return reject(new Error("Invalid local installation path."));

				if(!stat.isFile())
					return reject(new Error("Only files can be installed."));

				fs.readFile(plugin.path, function(err, file) {
					if(err)
						reject(new Error("Plugin file could not be read."));

					resolve(file.toString());
				});
			});
		}).then(this.parsePluginFile.bind(this)).then(function(result) {
			if(+plugin.copy)
				return new Promise(function(resolve, reject) {
					const location = config.fromUserData("plugins");

					copy(plugin.path, location, {
						deleteFirst: true,
						overwrite: true,
						confirm: true
					}, function(err, files) {
						if(err)
							return reject(new Error("Plugin files could not be installed."));

						result.manifest.location = path.join(location, path.basename(plugin.path));

						resolve(result.manifest);
					});
				});
			else {
				result.manifest.location = plugin.path;

				return result.manifest;
			}
		}).then(this.installManifest.bind(this)).then(function(manifest) {
			return new Plugin();
		});
	},

	/* Helpers: */

	parsePluginFile(file) {
		const startOfManifest = file.indexOf("/*");
		const endOfManifest = file.indexOf("*/\n", startOfManifest);

		console.log(file);

		return {
			file,
			manifest: this.validateManifest(JSON.parse(file.substring(startOfManifest + 2, endOfManifest)))
		};
	},

	validateManifest(manifest) {

		if(!manifest.name || typeof manifest.name !== "string")
			throw new TypeError("Plugin name has to be a string.");

		if(!semver.valid(manifest.version))
			throw new TypeError("Plugin version has to be semver compliant.");

		const dbPlugin = store.by("name", manifest.name);

		if(dbPlugin && (dbPlugin.block || semver.gte(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
			throw new Error(`Plugin with name ${manifest.name} already installed.`);

		return manifest;
	},

	installManifest(manifest) {

		const dbPlugin = store.by("name", manifest.name);

		if(dbPlugin)
			store.remove(dbPlugin);

		store.insert(manifest);

		return manifest;
	}
};

module.exports = install;
