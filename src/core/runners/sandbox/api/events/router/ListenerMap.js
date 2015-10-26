"use strict";

const createListener = require("./createListener");

class ListenerMap extends Map {
	constructor(target) {
		super();
		this.target = target;
	}

	getListener(event) {
		let listener = this.get(event);

		if(!listener) {
			listener = createListener(this);

			this.target.on(event, listener);
			this.set(event, listener);
		}

		return listener;
	}

	removeListener(event) {
		const listener = this.get(event);

		if(!listener)
			return false;

		this.delete(listener);

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

		for(const listener of this.values()) {
			this.delete(listener);

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
