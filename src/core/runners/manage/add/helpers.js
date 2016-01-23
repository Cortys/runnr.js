"use strict";

const store = require("../../store");

module.exports = {
	__proto__: require("../../helpers"),

	insertRunner(runner) {
		return store.collection.insert(runner);
	}
};
