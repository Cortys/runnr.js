"use strict";

const owe = require("owe.js");
const semver = require("semver");

const store = require("../../store");

module.exports = {
	validateTarget(manifest, target, allowDowngrade) {
		const plugin = store.collection.by("name", manifest.name);

		if(!allowDowngrade && semver.gte(target.version, manifest.version))
			throw new owe.exposed.Error(`Plugin '${target.name}' appears to be up-to-date.`);

		if(plugin && plugin !== target)
			throw new owe.exposed.Error(`The name of '${target.name}' has been changed to '${manifest.name}' in version ${manifest.version}. There already is another plugin with that name installed though.`);

		return target;
	}
};
