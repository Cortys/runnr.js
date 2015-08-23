"use strict";

const owe = require("owe.js");

const pluginMap = new WeakMap();

const dbPlugin = Symbol("dbPlugin");

class Plugin {
	constructor(plugin) {

		let res;

		if((res = pluginMap.get(plugin)))
			return res;

		pluginMap.set(plugin, this);

		this[dbPlugin] = plugin;

		owe(this, owe.serve());
	}

	get id() {
		return this[dbPlugin].$loki;
	}

	get name() {
		return this[dbPlugin].name;
	}

	get author() {
		return this[dbPlugin].author;
	}

	get source() {
		return this[dbPlugin].source;
	}

	get location() {
		return this[dbPlugin].location;
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			source: this.source
		};
	}
}

module.exports = Plugin;
