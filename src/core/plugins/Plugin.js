"use strict";

const owe = require("owe.js");

const pluginMap = new Map();

const dbPlugin = Symbol("dbPlugin");

class Plugin {
	constructor(plugin) {

		let res;

		if((res = pluginMap.get(plugin.$loki)))
			return res;

		pluginMap.set(plugin.$loki, this);

		this[dbPlugin] = plugin;

		owe(this, owe.serve());
	}

	get id() {
		return this[dbPlugin].$loki;
	}

	get name() {
		return this[dbPlugin].name;
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name
		};
	}
}

module.exports = Plugin;
