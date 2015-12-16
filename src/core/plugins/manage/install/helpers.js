"use strict";

const childProcess = require("child_process");
const semver = require("semver");
const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const config = require("../../../config");
const store = require("../../store");

const ports = require("../../../helpers/ports");

const npmCli = require.resolve("npm/bin/npm-cli");

module.exports = {
	validateManifest(manifest) {
		try {
			normalizePackage(manifest, true);
		}
		catch(err) {
			throw owe.expose(err);
		}

		const dbPlugin = store.collection.by("name", manifest.name);

		if(dbPlugin && (semver.gte(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
			throw new owe.exposed.Error(`Plugin with name '${manifest.name}' already installed.`);

		if(!manifest.displayName || typeof manifest.displayName !== "string")
			manifest.displayName = manifest.name;

		// Check ports:
		manifest.ports = ports.validate(manifest.ports);

		return manifest;
	},

	installManifest(manifest) {
		const dbPlugin = store.collection.by("name", manifest.name);

		if(dbPlugin)
			store.remove(dbPlugin);

		store.collection.insert(manifest);

		return manifest;
	},

	installDependencies(manifest) {
		return new Promise((resolve, reject) => {
			childProcess.fork(npmCli, ["install"], {
				cwd: config.fromPlugins(manifest.location),
				silent: true,
				execArgv: []
			}).once("exit", code => (code ? reject : resolve)(code));
		}).catch(() => {
			throw new owe.exposed.Error("Plugin dependencies could not be installed.");
		});
	}
};
