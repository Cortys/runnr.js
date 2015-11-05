"use strict";

const owe = require("owe-core");
const Listener = require("./Listener");

const count = function*() {
	let position = 0;

	while(true) {
		if(!Number.isSafeInteger(position) || position === -1)
			position = Number.MIN_SAFE_INTEGER;

		yield position++;
	}
}();

/**
 * Stores all event listeners for a single target event emitter.
 */
class EventEmitter extends Map {
	constructor(target) {
		super();
		this.target = target;
		this.id = count.next().value;

		target.on("removeListener",
			(event, removed) => this.get(event) === removed && this.removeListener(event));

		// EventEmitters are exposed via their id to prevent leaking data of target:
		owe.resource(this, {
			expose: this.id
		});
	}

	getListener(event) {
		let listener = this.get(event);

		if(!listener) {
			listener = Listener.create(this, event);
			this.target.on(event, listener);
			this.set(event, listener);
		}

		return listener;
	}

	/**
	 * Override Map#delete to remove a listener from its event emitter when removed from this map.
	 * @param {string} event The event that should be removed.
	 * @return {boolean} true if an event listener was removed, false elsewise.
	 */
	delete(event) {
		const listener = this.get(event);

		if(!listener)
			return false;

		super.delete(event);

		this.target.removeListener(event, listener);

		return true;
	}

	removeListener(event) {
		const listener = this.get(event);

		if(!listener)
			return false;

		this.delete(event);

		for(const entry of listener.apis) {
			const api = entry[0];
			const ids = entry[1];
			const removed = [];

			removed.push(...ids.keys());

			if(api.connected)
				api.close({ removed });
		}

		return true;
	}

	removeAllListenersFromApi(api) {
		const removed = [];

		for(const entry of this) {
			const listener = entry[1];
			const ids = listener.removeAllFromApi(api, true);

			if(ids)
				removed.push(...ids.keys());
		}

		if(api.connected)
			api.close({ removed });
	}
}

module.exports = EventEmitter;
