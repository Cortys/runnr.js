"use strict";

const ListenerMap = require("./ListenerMap");

/**
 * Stores listeners for multiple event emitters.
 */
class Listeners extends WeakMap {
	forTarget(target) {
		let listenerMap = this.get(target);

		if(!listenerMap) {
			listenerMap = new ListenerMap(target);
			this.set(target, listenerMap);
		}

		return listenerMap;
	}
}

module.exports = Listeners;
