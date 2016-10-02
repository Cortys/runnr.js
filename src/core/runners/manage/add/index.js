"use strict";

const owe = require("owe.js");

const Runner = require("../../Runner");
const Persistable = require("../../../store/Persistable");
const generateLock = require("../../../helpers/generateLock");
const manager = require("../../../managers").taskManager;

function add(runner) {
	if(typeof runner !== "object" || !runner)
		return Promise.reject(new owe.exposed.TypeError(`Given runner '${runner}' cannot be added.`));

	if(runner.type in additionTypes) {
		let runnerInstance;
		const lock = generateLock();
		const delayer = runner => {
			return manager.delay(
				runnerInstance = new Runner(),
				lock,
				"add"
			).then(() => runner);
		};

		return lock.unlock(additionTypes[runner.type](runner, delayer)
			.then(runner => {
				runnerInstance.assign(runner);

				return runnerInstance[Persistable.insert]();
			}));
	}
	else
		return Promise.reject(new owe.exposed.Error("Runners cannot be added with the given method."));
}

const additionTypes = {
	__proto__: null,

	empty: require("./empty")
};

module.exports = add;
