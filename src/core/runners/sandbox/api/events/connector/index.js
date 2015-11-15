"use strict";

const generating = require("../generatingMaps");
const EventEmitter = require("./EventEmitter");

const eventEmitters = new generating.WeakMap(object => new EventEmitter(object));

const connector = {
	__proto__: null,

	addListener(object, data, api) {
		return eventEmitters.get(object).addListener(data.event, data.id, api);
	},

	removeListener(object, data, api) {
		const eventEmitter = eventEmitters.lookup(object);

		return eventEmitter
			? eventEmitter.removeListener(data.event, api)
			: false;
	},

	listeners(object, data, api) {
		const eventEmitter = eventEmitters.lookup(object);

		return eventEmitter
			? eventEmitter.listeners(data.event, api)
			: [];
	}
};

module.exports = connector;
