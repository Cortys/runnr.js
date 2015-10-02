"use strict";

const store = require("../store");

function deleteRunner(runner) {
	return Promise.resolve(store.remove(runner));
}

module.exports = deleteRunner;
