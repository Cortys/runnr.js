"use strict";

const generateLock = require("../../helpers/generateLock");
const manager = require("../../taskManager");

const store = require("../store");

function deleteRunner(runner) {
	const lock = generateLock();

	return runner.disableUntil(lock).then(() => store.collection.remove(runner)).then(() => true, err => {
		lock.unlock();

		throw err;
	});
}

module.exports = manager.taskify(deleteRunner, runner => runner, "delete");
