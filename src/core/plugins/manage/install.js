"use strict";

const fs = require("fs");
const path = require("path");
const copy = require("cpr");
const semver = require("semver");
const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const config = require("../../config");
const store = require("../store");

function install(plugin, map) {

	if(typeof plugin !== "object" || !plugin)
		throw new owe.exposed.TypeError(`Given plugin '${plugin}' cannot be installed.`);

	if(helpers.installationTypes[plugin.type] in helpers)
		return helpers[helpers.installationTypes[plugin.type]](plugin)
			.then(manifest => helpers.installManifest(map(manifest)));
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
			else {
				result.manifest.location = path.dirname(plugin.path);

				return result.manifest;
			}
		});
	},

	/* Helpers: */

	parsePluginFile(file) {

		const startToken = "/**package\n";
		const endToken = "**/\n";

		const startOfManifest = file.indexOf(startToken);
		const endOfManifest = file.indexOf(endToken, startOfManifest + startToken.length);

		if(startOfManifest < 0 || endOfManifest < 0)
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
			manifest: this.validateManifest(manifest)
		};
	},

	validateManifest(manifest) {

		try {
			normalizePackage(manifest, true);
		}
		catch(err) {
			throw owe.expose(err);
		}

		if(!manifest.displayName || typeof manifest.displayName !== "string")
			manifest.displayName = manifest.name;

		const dbPlugin = store.collection.by("name", manifest.name);

		if(dbPlugin && (dbPlugin.block || semver.gte(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
			throw new owe.exposed.Error(`Plugin with name '${manifest.name}' already installed.`);

		return manifest;
	},

	installManifest(manifest) {

		const dbPlugin = store.collection.by("name", manifest.name);

		if(dbPlugin)
			store.remove(dbPlugin);

		store.collection.insert(manifest);

		return manifest;
	}
};

module.exports = install;
