"use strict";

const owe = require("owe.js");

const store = require("../store");

function add(runner) {

	if(typeof runner !== "object" || !runner)
		throw new owe.exposed.TypeError(`Given runner '${runner}' cannot be added.`);

	if(helpers.installationTypes[runner.type] in helpers)
		return helpers[helpers.installationTypes[runner.type]](runner);
	else
		throw new owe.exposed.Error("Runners cannot be added with the given method.");
}

const helpers = {
	installationTypes: {
		__proto__: null,

		"empty": "empty"
	},

	/* Installation Types: */

	empty(runner) {
		return new Promise((resolve, reject) => {

			if(!runner.name || typeof runner.name !== "string")
				return reject(new owe.exposed.TypeError("Runner name has to be a string."));

			if(store.by("name", runner.name))
				return reject(new owe.exposed.Error(`Runner with name "${runner.name}" already exists.`));

			resolve(store.insert({
				name: runner.name,
				active: false
			}));
		});
	}
};

module.exports = add;
