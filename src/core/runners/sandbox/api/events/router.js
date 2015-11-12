"use strict";

const owe = require("owe-core");
const expose = require("../expose");

const receiverApis = new WeakMap();
const connector = require("../controller").connector;

function eventRouter() {
	return function servedEventRouter(route) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(route in connector) {
			let api = receiverApis.get(this.origin.eventsApi);

			if(!api) {
				api = this.origin.eventsApi.route("receiver");
				receiverApis.set(this.origin.eventsApi, api);
			}

			return owe(null, {
				closer: event => connector[route](this.value, event, api)
			});
		}

		throw expose(new Error(`Events cannot be accessed via method '${route}'.`));
	};
}

module.exports = eventRouter;
