"use strict";

const owe = require("owe-core");
const expose = require("../expose");

const pending = require("./pending");

const receiver = {
	addListener(api, event, listener) {
		return pending.add(api, event, listener, false);
	},

	once(api, event, listener) {
		return pending.add(api, event, listener, true);
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

	addConfirmation(data) {
		pending.handleAddConfirmation(data.id, data.token);
	},

	emit(data) {

	}
};

owe(receiver, {
	closer(data) {
		if(!data || typeof data !== "object" || !(data.type in messageHandlers))
			throw expose(new TypeError("Invalid message."));

		return messageHandlers[data.type](data);
	}
});

require("./clientFixer")(receiver);

module.exports = receiver;
