"use strict";

const owe = require("owe-core");
const expose = require("../expose");
const Listeners = require("./Listeners");
const listeners = new Listeners();

function eventRouter() {
	return function servedEventRouter(route) {
		if(!(this.origin.eventsApi && typeof this.origin.eventsApi === "object"))
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
	if(typeof event !== "string" || event === "newListener" || event === "removeListener")
		throw expose(new TypeError(`Invalid event '${event}'.`));

	listeners.forTarget(this.value).getListener(event).addToApi(this.origin.eventsApi, id, once);

	return id;
}

const methods = {
	on(data) {
		if(!data || !typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, false);
	},

	once(data) {
		if(!data || !typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		return add.call(this, data.event, +data.id, true);
	},

	removeListener(data) {
		if(!data || !typeof data !== "object")
			throw expose(new TypeError("Invalid removal request."));

		const listenerMap = listeners.get(this.value);

		if(!listenerMap)
			return false;

		const listener = listenerMap.get(data.event);

		return listener && listener.removeFromApi(this.origin.eventsApi, data.id) || false;
	},

	removeAllListeners(event) {
		const listenerMap = listeners.get(this.value);

		if(!listenerMap)
			return false;

		return event === undefined
			? listenerMap.removeAllListeners()
			: listenerMap.removeListener(event);
	},

	listeners(event) {
		const listenerMap = listeners.get(this.value);

		if(!listenerMap)
			return [];

		const listener = listenerMap.get(event);

		if(!listener)
			return [];

		return listener.idsForApi(this.origin.eventsApi);
	},

	listenerCount(event) {
		const listenerMap = listeners.get(this.value);

		if(!listenerMap)
			return 0;

		const listener = listenerMap.get(event);

		if(!listener)
			return 0;

		return listener.idCountForApi(this.origin.eventsApi);
	}
};

methods.addListener = methods.on;

module.exports = eventRouter;
