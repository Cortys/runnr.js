"use strict";

const owe = require("owe.js");

module.exports = {
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

const pluginTypes = {
	__proto__: null,

	"js": require("./JsPlugin"),
	"graph": require("./GraphPlugin")
};
