"use strict";

const manager = require("../../taskManager");

const store = require("../store");

function deleteRunner(runner) {
	return runner.deactivate().then(() => store.collection.remove(runner));
}

module.exports = manager.taskify(deleteRunner, runner => runner, "delete");
