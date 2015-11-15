"use strict";

const owe = require("owe-core");

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

owe(receiver, {
	closer(data) {

	}
});

require("./clientFixer")(receiver);

module.exports = receiver;
