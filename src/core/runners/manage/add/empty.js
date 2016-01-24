"use strict";

const helpers = require("./helpers");

function empty(runner, delayer) {
	return new Promise(resolve => resolve({
		name: helpers.validateName(runner.name),
		active: false
	})).then(delayer);
}

module.exports = empty;
