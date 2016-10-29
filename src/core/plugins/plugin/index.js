"use strict";

const owe = require("owe.js");

require("../graph").register();

module.exports = {
	instanciate(preset) {
		const { type = "js" } = preset;

		if(!(type in pluginTypes))
			throw new owe.exposed.Error(`Unknown plugin type '${type}'.`);

		return Object.assign(new pluginTypes[type](), { type });
	},

	create(preset) {
		return this.instanciate(preset).assign(preset);
	}
};

const pluginTypes = {
	__proto__: null,

	"js": require("./JsPlugin"),
	"graph": require("./GraphPlugin"),
	"customGraph": require("./CustomGraphPlugin")
};
