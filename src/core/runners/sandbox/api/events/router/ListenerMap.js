"use strict";

const Listener = require("./Listener");

/**
 * Stores all event listeners for a single target event emitter.
 */
class ListenerMap extends Map {
	constructor(target) {
		super();
		this.target = target;

		target.on(
			"removeListener",
			(event, removed) => this.get(event) === removed && this.removeListener(event)
		);
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

			ids.keys().forEach(id => removed.push(id));

			api.close({ removed });
		}

		return true;
	}

	removeAllListeners() {
		const apis = new Map();

		for(const entry of this) {
			const event = entry[0];
			const listener = entry[1];

			this.delete(event);

			for(const entry of listener.apis) {
				const api = entry[0];
				const ids = entry[1];

				let alreadyRemoved = apis.get(api);

				if(!alreadyRemoved) {
					alreadyRemoved = [];
					apis.set(api, alreadyRemoved);
				}

				ids.keys().forEach(id => alreadyRemoved.push(id));
			}
		}

		for(const entry of apis) {
			const api = entry[0];
			const removed = entry[1];

			api.close({ removed });
		}
	}
}

module.exports = ListenerMap;
