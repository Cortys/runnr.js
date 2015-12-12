"use strict";

const semver = require("semver");
const normalizePackage = require("normalize-package-data");
const owe = require("owe.js");

const store = require("../../store");

const ports = require("../../../helpers/ports");

module.exports = {
	validateManifest(manifest) {
		try {
			normalizePackage(manifest, true);
		}
		catch(err) {
			throw owe.expose(err);
		}

		const dbPlugin = store.collection.by("name", manifest.name);

		if(dbPlugin && (dbPlugin.block || semver.gte(dbPlugin.version, manifest.version) || dbPlugin.author !== manifest.author))
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
	}
};
