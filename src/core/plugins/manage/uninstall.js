"use strict";

const owe = require("owe.js");
const remove = require("remove");

const store = require("../store");

function uninstall(plugin) {
	return new Promise((resolve, reject) => {
		if(!plugin.copied)
			return resolve();

		remove(plugin.location, err => {
			if(err)
				reject(err);
			resolve();
		});
	}).then(() => store.remove(plugin), err => {
		if(err && err.code === "ENOENT")
			return store.remove(plugin);

		throw new owe.exposed.Error("Plugin could not be removed from the plugins directory.");
	});
}

module.exports = uninstall;
