"use strict";

const store = require("../store");

function deleteRunner(runner) {
	return runner.deactivate().then(() => store.collection.remove(runner));
}

module.exports = deleteRunner;
