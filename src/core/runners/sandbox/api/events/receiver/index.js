"use strict";

const owe = require("owe-core");
const expose = require("../expose");

const pending = require("./pending");
const listeners = require("./listeners");

const receiver = {
	add(api, event, listener, once) {
		return pending.add(api, event, listener, once)
			.then(entry => listeners.add(entry));
	},

	addListener(api, event, listener) {
		return this.add(api, event, listener, false);
	},

	once(api, event, listener) {
		return this.add(api, event, listener, true);
	},

	removeListener(api, event, listener) {

	},

	removeAllListeners(api, event) {

	},

	listeners(api, event) {

	},

	listenerCount(api, event) {

	}
};

const messageHandlers = {
	__proto__: null,

	addConfirmation(api, data) {
		pending.handleAddConfirmation(api, data.id, data.token);
	},

	emit(api, data) {

	}
};

owe(receiver, {
	closer(data) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(!data || typeof data !== "object" || !(data.type in messageHandlers))
			throw expose(new TypeError("Invalid message."));

		return messageHandlers[data.type](this.origin.eventsApi, data);
	}
});

require("./clientFixer")(receiver);

module.exports = receiver;
