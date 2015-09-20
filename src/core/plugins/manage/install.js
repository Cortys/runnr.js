"use strict";

const fs = require("fs");
const path = require("path");
const copy = require("cpr");
const semver = require("semver");
const sanitizeFilename = require("sanitize-filename");
const owe = require("owe.js");

const config = require("../../config");
const store = require("../store");

function install(plugin) {

	if(typeof plugin !== "object" || !plugin)
		throw new owe.exposed.TypeError(`Given plugin '${plugin}' cannot be installed.`);

	if(helpers.installationTypes[plugin.type] in helpers)
		return helpers[helpers.installationTypes[plugin.type]](plugin);
	else
		throw new owe.exposed.Error("Plugins cannot be installed with the given installation method.");
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

		return new Promise((resolve, reject) => {
			fs.stat(plugin.path, (err, stat) => {
				if(err)
					return reject(new owe.exposed.Error("Invalid local installation path."));

				if(!stat.isFile())
					return reject(new owe.exposed.Error("Only files can be installed."));

				fs.readFile(plugin.path, (err, file) => {
					if(err)
						reject(new owe.exposed.Error("Plugin file could not be read."));

					resolve(file.toString());
				});
			});
		}).then(file => this.parsePluginFile(file)).then(result => {

			result.manifest.main = path.basename(plugin.path);

			if(+plugin.copy)
				return new Promise((resolve, reject) => {
					const location = path.join(config.fromUserData("plugins"), result.manifest.name);

					copy(plugin.path, location, {
						deleteFirst: true,
						overwrite: true,
						confirm: true
					}, (err, files) => {
						if(err)
							return reject(new owe.exposed.Error("Plugin files could not be installed."));

						result.manifest.location = location;
						result.manifest.copied = true;

						resolve(result.manifest);
					});
				});
			else {
				result.manifest.location = path.dirname(plugin.path);

				return result.manifest;
			}
		}).then(manifest => this.installManifest(manifest));
	},

	/* Helpers: */

	parsePluginFile(file) {
		const startOfManifest = file.indexOf("/*");
		const endOfManifest = file.indexOf("*/\n", startOfManifest);

		return {
			file,
			manifest: this.validateManifest(JSON.parse(file.substring(startOfManifest + 2, endOfManifest)))
		};
	},

	validateManifest(manifest) {

		if(!manifest.name || typeof manifest.name !== "string")
			throw new owe.exposed.TypeError("Plugin name has to be a string.");

		if(manifest.name !== sanitizeFilename(manifest.name))
			throw new owe.exposed.TypeError(`Plugin name '${manifest.name}' is invalid.`);

		if(!semver.valid(manifest.version))
			throw new owe.exposed.TypeError("Plugin version has to be semver compliant.");

		const dbPlugin = store.by("name", manifest.name);

		if(dbPlugin && (dbPlugin.block || semver.gte(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
			throw new owe.exposed.Error(`Plugin with name '${manifest.name}' already installed.`);

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
