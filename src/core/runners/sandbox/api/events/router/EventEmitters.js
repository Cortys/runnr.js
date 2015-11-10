"use strict";

const EventEmitter = require("./EventEmitter");

/**
 * Stores listeners for multiple event emitters.
 */
module.exports = new class extends WeakMap {
	forTarget(target) {
		let eventEmitter = this.get(target);

		if(!eventEmitter) {
			eventEmitter = new EventEmitter(target);
			this.set(target, eventEmitter);
		}

		return eventEmitter;
	}
};
