"use strict";

const owe = require("owe-core");
const expose = require("../expose");
const EventEmitters = require("./EventEmitters");
const eventEmitters = new EventEmitters();

function eventRouter() {
	return function servedEventRouter(route) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(route in methods)
			return owe(null, {
				closer: data => {
					return methods[route].call(this, data);
				}
			});

		throw expose(new Error(`Events cannot be accessed via method '${route}'.`));
	};
}

function add(event, id, once) {
	if(typeof event !== "string")
		throw expose(new TypeError(`Invalid event '${event}'.`));

	const eventEmitter = eventEmitters.forTarget(this.value);

	if(event === "newListener" || event === "removeListener")
		return {
			eventEmitter: eventEmitter.id
		};

	eventEmitter.getListener(event).addToApi(this.origin.eventsApi, id, once);

	return {
		id,
		eventEmitter: eventEmitter.id
	};
}

const methods = {
	on(data) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, false);
	},

	once(data) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, true);
	},

	removeListener(data) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid removal request."));

		const eventEmitter = eventEmitters.get(this.value);

		if(!eventEmitter)
			return false;

		const listener = eventEmitter.get(data.event);

		return listener && listener.removeFromApi(this.origin.eventsApi, data.idCandidates) || false;
	},

	removeAllListeners(event) {
		const eventEmitter = eventEmitters.get(this.value);

		if(!eventEmitter)
			return false;

		if(event == null)
			return eventEmitter.removeAllListenersFromApi(this.origin.eventsApi);

		const listener = eventEmitter.get(event);

		return listener && listener.removeAllFromApi(this.origin.eventsApi) || false;
	},

	listeners(event) {
		const eventEmitter = eventEmitters.get(this.value);

		if(!eventEmitter)
			return [];

		const listener = eventEmitter.get(event);

		if(!listener)
			return [];

		return listener.idsForApi(this.origin.eventsApi);
	},

	listenerCount(event) {
		const eventEmitter = eventEmitters.get(this.value);

		if(!eventEmitter)
			return 0;

		const listener = eventEmitter.get(event);

		if(!listener)
			return 0;

		return listener.idCountForApi(this.origin.eventsApi);
	}
};

methods.addListener = methods.on;

module.exports = eventRouter;
