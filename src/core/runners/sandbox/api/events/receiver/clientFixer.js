"use strict";

const ClientApi = require("owe-core/src/ClientApi");

module.exports = receiver => {
	function add(event, listener, method) {

	}

	Object.assign(ClientApi.prototype, {
		on(event, listener) {
			return add.call(this, event, listener, "on");
		},

		once(event, listener) {
			return add.call(this, event, listener, "once");
		},

		removeListener(event, listener) {

		},

		removeAllListeners(event) {

		},

		listeners(event) {

		},

		listenerCount(event) {

		}
	});

	ClientApi.prototype.addListener = ClientApi.prototype.on;
};
