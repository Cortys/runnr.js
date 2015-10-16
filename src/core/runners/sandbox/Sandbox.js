"use strict";

const owe = require("owe.js");
const sandboxedModule = require("sandboxed-module");

const sandbox = Symbol("sandbox");

class Sandbox {
	constructor() {

		this[sandbox] = sandboxedModule.load("./master", {
			globals: {
				runnr: "Hello World!"
			},
			singleOnly: false
		});

		owe(this);
		owe.expose.properties(this, []);
	}
}

module.exports = Sandbox;
