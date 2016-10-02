"use strict";

const generateLock = require("../../helpers/generateLock");
const Persistable = require("../../store/Persistable");
const manager = require("../../managers").taskManager;

function deleteRunner(runner) {
	const lock = generateLock();

	return runner.disableUntil(lock).then(() => runner[Persistable.delete]()).then(() => true, err => {
		lock.unlock();

		throw err;
	});
}

module.exports = manager.taskify(deleteRunner, runner => runner, "delete");
