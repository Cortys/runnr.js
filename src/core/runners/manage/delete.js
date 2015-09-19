"use strict";

const store = require("../store");

function deleteRunner(runner) {
	return runner.deactivate().then(() => {
		store.remove(runner.id);
	});
}

module.exports = deleteRunner;
