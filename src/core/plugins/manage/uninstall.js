"use strict";

const owe = require("owe.js");
const remove = require("remove");

const store = require("../store");

function uninstall(plugin) {
	return new Promise(function(resolve, reject) {
		if(!plugin.copied)
			return resolve();

		remove(plugin.location, function(err) {
			if(err)
				reject(new owe.exposed.Error("Plugin could not be removed from the plugins directory."));
			resolve();
		});
	}).then(function() {
		store.remove(plugin.id);
	});
}

module.exports = uninstall;
