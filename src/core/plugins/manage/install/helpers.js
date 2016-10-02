"use strict";

const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const Persistable = require("../../../store/Persistable");
const ports = require("../../../graph/helpers/ports");

const plugin = require("../../plugin");
const store = require("../../store");

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
		const stored = store.collection.by("name", manifest.name);

		if(stored)
			return stored;

		const instance = plugin.instanciate(manifest);

		instance.name = manifest.name;
		instance[Persistable.insert]();

		return instance;
	}
};
