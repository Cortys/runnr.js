"use strict";

const owe = require("owe-core");
const expose = require("../expose");

const receiverApis = new WeakMap();
const eventEmitters = require("./eventEmitters");

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

const methods = {
	__proto__: null,

	addListener(data, api) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid addListener request."));

		eventEmitters.get(this.value);
	},

	removeListener(data, api) {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Invalid removal request."));
	},

	removeAllListeners(event, api) {

	},

	listeners(event, api) {

	}
};

module.exports = eventRouter;
