"use strict";

const owe = require("owe-core");
const expose = require("../expose");
const generating = require("../generatingMaps");

const EventEmitter = require("./EventEmitter");

const receiverApis = new generating.WeakMap(api => api.route("receiver"));

const connector = {
	__proto__: null,

	addListener(object, data, api) {
		return EventEmitter.forObject(object).addListener(data.event, data.id, receiverApis.get(api));
	},

	removeListener(object, data, api) {
		const eventEmitter = EventEmitter.lookupObject(object);

		if(!data.clientOnly)
			return eventEmitter
				? eventEmitter.removeListener(data.event, receiverApis.get(api))
				: false;

		if(eventEmitter)
			return receiverApis.get(api).close({
				type: "remove",
				object: eventEmitter.id,
				event: data.event,
				listener: data.listener
			});
	}
};

const messageHandlers = {
	__proto__: null,

	remove(api, data) {
		return EventEmitter.lookupId(data.object).removeListener(data.event, receiverApis.get(api));
	}
};

owe(connector, {
	closer(data) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(!data || typeof data !== "object" || !(data.type in messageHandlers))
			throw expose(new TypeError("Invalid message."));

		return messageHandlers[data.type](this.origin.eventsApi, data);
	}
});

module.exports = connector;
