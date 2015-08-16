"use strict";

const owe = require("owe.js");

class Plugin {
	constructor() {
		owe(this, owe.serve());
	}
}

module.exports = Plugin;
