"use strict";

const childProcess = require("child_process");
const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const Plugin = require("../../Plugin");
const config = require("../../../config");
const store = require("../../store");

const ports = require("../../../graph/helpers/ports");

const npmCli = require.resolve("npm/bin/npm-cli");

module.exports = {
	validateManifest(manifest) {
		try {
			normalizePackage(manifest, true);
		}
		catch(err) {
			throw owe.expose(err);
		}

		if("$loki" in manifest || "meta" in manifest)
			throw new owe.exposed.Error("'$loki' and 'meta' are forbidden in runnr plugin manifests.");

		if(!manifest.displayName || typeof manifest.displayName !== "string")
			manifest.displayName = manifest.name;

		if(typeof manifest.source !== "string" || manifest.source === "local")
			manifest.source = undefined;

		// Check ports:
		manifest.ports = ports.validate(manifest.ports);

		return manifest;
	},

	getTarget(manifest) {
		return store.collection.by("name", manifest.name) || new Plugin();
	},

	installManifest(manifest) {
		if(!("$loki" in manifest || "meta" in manifest))
			store.collection.insert(manifest);

		return manifest;
	},

	installDependencies(manifest) {
		return new Promise((resolve, reject) => {
			childProcess.fork(npmCli, ["install", "--production"], {
				cwd: config.fromPlugins(manifest.location),
				silent: true,
				execArgv: []
			}).once("exit", code => (code ? reject : resolve)(code));
		}).catch(() => {
			throw new owe.exposed.Error("Plugin dependencies could not be installed.");
		});
	}
};
