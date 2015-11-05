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
				closer: data => methods[route].call(this, data)
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
			eventEmitter
		};

	eventEmitter.getListener(event).addToApi(this.origin.eventsApi, id, once);

	return {
		id,
		eventEmitter
	};
}

const methods = {
	__proto__: null,

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

		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(data.event);

		return {
			removed: listener && listener.removeFromApi(this.origin.eventsApi, data.idCandidates) || false,
			eventEmitter
		};
	},

	removeAllListeners(event) {
		const eventEmitter = eventEmitters.forTarget(this.value);

		if(event == null)
			return {
				removed: eventEmitter.removeAllListenersFromApi(this.origin.eventsApi),
				eventEmitter
			};

		const listener = eventEmitter.get(event);

		return {
			removed: listener && listener.removeAllFromApi(this.origin.eventsApi) || false,
			eventEmitter
		};
	},

	listeners(event) {
		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(event);

		if(!listener)
			return {
				listeners: [],
				eventEmitter
			};

		return listener.idsForApi(this.origin.eventsApi);
	},

	listenerCount(event) {
		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(event);

		if(!listener)
			return {
				count: 0,
				eventEmitter
			};

		return {
			count: listener.idCountForApi(this.origin.eventsApi),
			eventEmitter
		};
	}
};

methods.addListener = methods.on;

module.exports = eventRouter;
