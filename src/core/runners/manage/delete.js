"use strict";

const store = require("../store");

function deleteRunner(runner) {
	return Promise.resolve(store.collection.remove(runner));
}

module.exports = deleteRunner;
