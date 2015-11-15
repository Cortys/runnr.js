"use strict";

const generating = require("../generatingMaps");
const EventEmitter = require("./EventEmitter");

const eventEmitters = new generating.WeakMap(object => new EventEmitter(object));

const connector = {
	__proto__: null,

	addListener(object, event, api) {
		return eventEmitters.get(object).addListener(event, api);
	},

	removeListener(object, event, api) {
		const eventEmitter = eventEmitters.lookup(object);

		return eventEmitter
			? eventEmitter.removeListener(event, api)
			: false;
	},

	listeners(object, event, api) {
		const eventEmitter = eventEmitters.lookup(object);

		return eventEmitter
			? eventEmitter.listeners(event, api)
			: [];
	}
};

module.exports = connector;
