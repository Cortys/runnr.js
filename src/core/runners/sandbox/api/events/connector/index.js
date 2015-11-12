"use strict";

const eventEmitters = require("./eventEmitters");

const connector = {
	__proto__: null,

	addListener(object, event, api) {
		eventEmitters.get(object).addListener(event, api);
	},

	removeListener(object, event, api) {
		const eventEmitter = eventEmitters.lookup(object);

		if(eventEmitter)
			eventEmitter.removeListener(event, api);
	},

	listeners(object, event, api) {
		const eventEmitter = eventEmitters.lookup(object);

		if(eventEmitter)
			eventEmitter.listeners(event, api);
	}
};

module.exports = connector;
