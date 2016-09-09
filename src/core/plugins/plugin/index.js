"use strict";

const owe = require("owe.js");

const Plugin = require("./Plugin");

const pluginTypes = {
	__proto__: null,

	"js": require("./JsPlugin"),
	"graph": require("./GraphPlugin")
};

module.exports = {
	Plugin,

	instanciate(preset) {
		const { type = "js" } = preset;

		if(!(type in pluginTypes))
			throw new owe.exposed.Error(`Unknown plugin type '${type}'.`);

		return new pluginTypes[type]();
	},

	create(preset) {
		return this.instanciate(preset).assign(preset);
	}
};
