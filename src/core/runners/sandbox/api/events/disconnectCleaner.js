"use strict";

const apis = new WeakMap();

const cleaner = {
	attach(api, handler) {
		let apiMeta = apis.get(api);

		if(!apiMeta) {
			apiMeta = {
				handlers: new Set(),
				listener(connected) {
					if(connected)
						return;

					apiMeta.handlers.forEach(handler => setImmediate(() => handler.removeApi(api)));
				}
			};
			apis.set(api, apiMeta);
			api.subscribeProtocol(apiMeta.listener);
		}

		apiMeta.handlers.add(handler);
	},

	detach(api, handler) {
		const apiMeta = apis.get(api);

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
