"use strict";

const owe = require("owe-core");
const expose = require("./expose");
const generating = require("./generatingMaps");

const receiverApis = new generating.WeakMap(api => api.route("receiver"));
const connector = require("./connector");

function eventRouter() {
	return function servedEventRouter(route) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(route in connector) {
			if(!data || typeof data !== "object")
				throw expose(new TypeError(`Invalid ${route} request.`));

			return owe(null, {
				closer: data => connector[route](
					this.value,
					data,
					receiverApis.get(this.origin.eventsApi)
				)
			});
		}

		throw expose(new Error(`Events cannot be accessed via method '${route}'.`));
	};
}

module.exports = eventRouter;
