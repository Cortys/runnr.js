"use strict";

const owe = require("owe-core");

const receiver = {
	addListener(api, event, listener) {

	},

	once(api, event, listener) {

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

module.exports = receiver;

require("./clientFixer")(receiver);
