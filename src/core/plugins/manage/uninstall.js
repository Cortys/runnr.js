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
				reject(new owe.exposed.Error("Plugin could not be removed from the plugins directory."));
			resolve();
		});
	}).then(() => store.remove(plugin.id), err => {
		store.remove(plugin.id);
		throw err;
	});
}

module.exports = uninstall;
