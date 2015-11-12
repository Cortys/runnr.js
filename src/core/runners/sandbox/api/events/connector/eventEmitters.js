"use strict";

const EventEmitter = require("./EventEmitter");
const eventEmitters = new WeakMap();

/**
 * Stores listeners for multiple event emitters.
 */
module.exports = {
	get(object) {
		let eventEmitter = eventEmitters.get(object);

		if(!eventEmitter) {
			eventEmitter = new EventEmitter(object);
			eventEmitters.set(object, eventEmitter);
		}

		return eventEmitter;
	},

	lookup(object) {
		return eventEmitters.get(object);
	}
};
