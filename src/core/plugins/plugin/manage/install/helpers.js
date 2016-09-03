"use strict";

const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const Plugin = require("../../Plugin");
const store = require("../../../store");

const ports = require("../../../../graph/helpers/ports");

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
		let stored = store.collection.by("name", manifest.name);

		if(!stored) {
			stored = new Plugin();
			stored.name = manifest.name;
			store.collection.insert(stored);
		}

		return stored;
	},

	insertPlugin(plugin) {
		if(!("$loki" in plugin || "meta" in plugin))
			store.collection.insert(plugin);

		return plugin;
	},

	removePlugin(plugin) {
		return store.collection.remove(plugin);
	}
};
