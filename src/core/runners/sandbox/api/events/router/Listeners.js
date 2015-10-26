"use strict";

const ListenerMap = require("./ListenerMap.js");

class Listeners extends WeakMap {
	forTarget(target) {
		let listenerMap = this.get(target);

		if(!listenerMap) {
			listenerMap = new ListenerMap(target);

			target.on(
				"removeListener",
				(event, removed) => listenerMap.get(event) === removed && listenerMap.removeListener(event)
			);
			this.set(target, listenerMap);
		}

		return listenerMap;
	}
}

module.exports = Listeners;
