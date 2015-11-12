"use strict";

const EventEmitter = require("./EventEmitter");
const eventEmitters = new WeakMap();

/**
 * Stores listeners for multiple event emitters.
 */
module.exports = {
	get(target) {
		let eventEmitter = eventEmitters.get(target);

		if(!eventEmitter) {
			eventEmitter = new EventEmitter(target);
			eventEmitters.set(target, eventEmitter);
		}

		return eventEmitter;
	}
};
