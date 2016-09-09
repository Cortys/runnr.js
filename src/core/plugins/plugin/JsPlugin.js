"use strict";

const { mixins } = require("mixwith");

const Plugin = require("./Plugin");

class JsPlugin extends mixins(Plugin) {
	constructor() {
		super();

		this.type = "js";
	}
}

module.exports = JsPlugin;
