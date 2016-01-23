"use strict";

const owe = require("owe.js");

const Runner = require("../../Runner");
const manager = require("../../../taskManager");
const helpers = require("./helpers");

function add(runner) {
	if(typeof runner !== "object" || !runner)
		return Promise.reject(new owe.exposed.TypeError(`Given runner '${runner}' cannot be added.`));

	if(runner.type in additionTypes) {
		let runnerInstance;
		const delayer = runner => {
			return manager.delay(
				runnerInstance = new Runner(),
				new Promise(resolve => setImmediate(() => resolve(promise))),
				"add"
			).then(() => runner);
		};

		const promise = additionTypes[runner.type](runner, delayer)
			.then(runner => helpers.insertRunner(runnerInstance.assign(runner)));

		return promise;
	}
	else
		return Promise.reject(new owe.exposed.Error("Runners cannot be added with the given method."));
}

const additionTypes = {
	__proto__: null,

	empty: require("./empty")
};

module.exports = add;
