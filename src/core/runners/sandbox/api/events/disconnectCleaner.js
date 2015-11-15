"use strict";

const generating = require("./generatingMaps");

const apis = new generating.WeakMap(api => {
	const apiMeta = {
		handlers: new Set(),
		listener(connected) {
			if(connected)
				return;

			apiMeta.handlers.forEach(handler => setImmediate(() => handler.removeApi(api)));
		}
	};

	api.subscribeProtocol(apiMeta.listener);

	return apiMeta;
});

const cleaner = {
	attach(api, handler) {
		apis.get(api).handlers.add(handler);
	},

	detach(api, handler) {
		const apiMeta = apis.lookup(api);

		if(!apiMeta)
			return;

		apiMeta.handlers.delete(handler);

		if(apiMeta.handlers.size === 0) {
			apis.delete(api);
			api.unsubscribeProtocol(apiMeta.listener);
		}
	}
};

module.exporst = cleaner;
