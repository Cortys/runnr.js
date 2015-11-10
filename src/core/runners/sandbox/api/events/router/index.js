"use strict";

const owe = require("owe-core");
const expose = require("../expose");
const eventEmitters = require("./eventEmitters");
const receiverApis = new WeakMap();

function eventRouter() {
	return function servedEventRouter(route) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(route in methods) {
			let api = receiverApis.get(this.origin.eventsApi);

			if(!api) {
				api = this.origin.eventsApi.route("receiver");
				receiverApis.set(this.origin.eventsApi, api);
			}

			return owe(null, {
				closer: data => methods[route].call(this, data, api)
			});
		}

		throw expose(new Error(`Events cannot be accessed via method '${route}'.`));
	};
}

function add(event, id, once, api) {
	if(typeof event !== "string")
		throw expose(new TypeError(`Invalid event '${event}'.`));

	const eventEmitter = eventEmitters.forTarget(this.value);

	if(event === "newListener" || event === "removeListener")
		return { eventEmitter };

	eventEmitter.getListener(event).addToApi(api, id, once);

	return { id, eventEmitter };
}

const methods = {
	__proto__: null,

	on(data, api) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, false, api);
	},

	once(data, api) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, true, api);
	},

	removeListener(data, api) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid removal request."));

		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(data.event);

		return {
			removed: listener && listener.removeFromApi(api, data.idCandidates) || false,
			eventEmitter
		};
	},

	removeAllListeners(event, api) {
		const eventEmitter = eventEmitters.forTarget(this.value);

		if(event == null)
			return {
				removed: eventEmitter.removeAllListenersFromApi(api),
				eventEmitter
			};

		const listener = eventEmitter.get(event);

		return {
			removed: listener && listener.removeAllFromApi(api) || false,
			eventEmitter
		};
	},

	listeners(event, api) {
		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(event);

		if(!listener)
			return {
				listeners: [],
				eventEmitter
			};

		return listener.idsForApi(api);
	},

	listenerCount(event, api) {
		const eventEmitter = eventEmitters.forTarget(this.value);
		const listener = eventEmitter.get(event);

		if(!listener)
			return {
				count: 0,
				eventEmitter
			};

		return {
			count: listener.idCountForApi(api),
			eventEmitter
		};
	}
};

methods.addListener = methods.on;

module.exports = eventRouter;
