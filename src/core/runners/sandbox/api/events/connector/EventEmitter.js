"use strict";

const counter = require("../counter")();
const disconnectCleaner = require("../disconnectCleaner.js");

class EventEmitter {
	constructor(object) {
		this.id = counter.count();
		this.object = object;
		this.events = new Map();
	}

	addListener(event, api) {
		let eventMeta = this.events.get(event);

		if(!eventMeta) {
			const object = this.id;

			eventMeta = {
				apis: new Set(),
				listener() {
					const send = {
						object,
						event,
						args: [...arguments]
					};

					eventMeta.apis.forEach(api => api.close(send));
				}
			};
			this.events.set(event, eventMeta);
			this.object.addListener(event, eventMeta.listener);
		}

		eventMeta.apis.add(api);
		disconnectCleaner.attach(api, this);
	}

	removeListener(event, api) {
		if(event == null)
			return this.removeApi(api);

		const eventMeta = this.events.get(event);

		if(!eventMeta)
			return false;

		const res = eventMeta.apis.delete(api);

		disconnectCleaner.detach(api, this);

		if(eventMeta.apis.size === 0) {
			this.events.delete(event);
			this.object.removeListener(event, eventMeta.listener);
		}

		return res;
	}

	removeApi(api) {
		let once = false;

		for(const event of this.events.keys())
			once = this.removeListener(event, api) || once;

		return once;
	}

	listeners(event, api) {
		const eventMeta = this.events.get(event);

		if(!eventMeta)
			return false;

		return eventMeta.apis.has(api);
	}
}

module.exports = EventEmitter;
