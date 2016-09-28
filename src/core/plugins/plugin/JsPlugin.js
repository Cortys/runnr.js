"use strict";

const { mixins } = require("mixwith");

const Plugin = require("./Plugin");

class JsPlugin extends mixins(Plugin) {
	assign(preset, checkForUpdates) {
		return super.assign(preset, { checkForUpdates });
	}
}

module.exports = JsPlugin;
