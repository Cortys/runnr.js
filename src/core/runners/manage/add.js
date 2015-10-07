"use strict";

const owe = require("owe.js");
const store = require("../store");

const runnerHelpers = require("./helpers");

function add(runner, map) {

	if(typeof runner !== "object" || !runner)
		throw new owe.exposed.TypeError(`Given runner '${runner}' cannot be added.`);

	if(helpers.installationTypes[runner.type] in helpers) {
		return helpers[helpers.installationTypes[runner.type]](runner)
			.then(runner => helpers.insertRunner(map(runner)));
	}
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
		return new Promise(resolve => resolve({
			name: runnerHelpers.validateName(runner.name),
			active: false
		}));
	},

	/* Helpers: */

	insertRunner(runner) {
		return store.collection.insert(runner);
	}

};

module.exports = add;
