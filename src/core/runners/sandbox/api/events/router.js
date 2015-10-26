"use strict";

const owe = require("owe-core");

function eventRouter() {
	const listeners = Object.assign(new WeakMap(), {

		forTarget(target) {
			let listenerMap = this.get(target);

			if(!listenerMap) {
				listenerMap = Object.assign(new Map(), {
					getListener(event) {
						let listener = this.get(event);

						if(!listener) {
							listener = createListener(this);

							target.on(event, listener);
							this.set(event, listener);
						}

						return listener;
					},

					removeListener(event) {
						const listener = this.get(event);

						if(!listener)
							return false;

						this.delete(listener);

						for(const entry of listener.apis) {
							const api = entry[0];
							const removed = [];

							entry[1].keys().forEach(id => removed.push(id));

							api.close({ removed });
						}

						return true;
					},

					removeAllListeners() {
						const apis = new Map();

						for(const listener of this.values()) {
							this.delete(listener);

							for(const entry of listener.apis) {
								const api = entry[0];

								let alreadyRemoved = apis.get(api);

								if(!alreadyRemoved) {
									alreadyRemoved = [];
									apis.set(api, alreadyRemoved);
								}

								entry[1].keys().forEach(id => alreadyRemoved.push(id));
							}
						}

						for(const entry of apis) {
							const api = entry[0];
							const removed = entry[1];

							api.close({ removed });
						}
					}
				});

				target.on(
					"removeListener",
					(event, removed) => listenerMap.get(event) === removed && listenerMap.removeListener(event)
				);
				this.set(target, listenerMap);
			}

			return listenerMap;
		}
	});

	function createListener(listeners) {
		return Object.assign(function oweEventListener() {
			const args = Array.from(arguments);

			for(const entry of oweEventListener.apis) {
				const api = entry[0];
				const ids = [];
				const removed = [];

				entry[1].forEach(id => {
					ids.push(id[0]);

					if(id[1]) {
						entry[1].delete(id[0]);
						removed.push(id[0]);
					}
				});

				api.close({
					ids,
					removed,
					arguments: args
				});
			}
		}, {
			apis: new Map(),

			idsForApi(api) {
				const ids = this.apis.get(api);

				return !ids ? [] : Array.from(ids.keys());
			},

			idCountForApi(api) {
				const ids = this.apis.get(api);

				return !ids ? 0 : ids.size;
			},

			addToApi(api, id, once) {
				const ids = this.apis.get(api);

				if(!ids)
					this.apis.set(api, new Map([[id, once]]));
				else
					ids.set(id, once);
			},

			removeFromApi(api, id) {
				const ids = this.apis.get(api);

				if(!ids)
					return false;

				const res = ids.delete(id);

				if(ids.size === 0)
					this.apis.delete(api);

				if(this.apis.size === 0)
					listeners.delete(this);

				if(res)
					api.close({
						removed: [id]
					});

				return res;
			}
		});
	}

	let idCount = 0;

	function add(event, once) {
		if(typeof event !== "string" || event === "newListener" || event === "removeListener")
			throw expose(new TypeError(`Invalid event '${event}'.`));

		if(!Number.isSafeInteger(idCount))
			idCount = 0;

		const id = idCount++;

		listeners.forTarget(this.value).getListener(event).addToApi(this.origin.eventsApi, id, once);

		return id;
	}

	const methods = {
		on(event) {
			return add.call(this, event, false);
		},

		once(event) {
			return add.call(this, event, true);
		},

		removeListener(data) {
			if(!data || !typeof data !== "object")
				throw expose(new TypeError("Invalid removal request."));

			const listeners = listeners.get(this.value);

			if(!listeners)
				return false;

			const listener = listeners.get(data.event);

			return listener && listener.removeFromApi(this.origin.eventsApi, data.id) || false;
		},

		removeAllListeners(event) {
			const listeners = listeners.get(this.value);

			if(!listeners)
				return false;

			return event === undefined
				? listeners.removeAllListeners()
				: listeners.removeListener(event);
		},

		listeners(event) {
			const listeners = listeners.get(this.value);

			if(!listeners)
				return [];

			const listener = listeners.get(event);

			if(!listener)
				return [];

			return listener.idsForApi(this.origin.eventsApi);
		},

		listenerCount(event) {
			const listeners = listeners.get(this.value);

			if(!listeners)
				return 0;

			const listener = listeners.get(event);

			if(!listener)
				return 0;

			return listener.idCountForApi(this.origin.eventsApi);
		}
	};

	methods.addListener = methods.on;

	return function servedEventRouter(route) {
		if(!(this.origin.eventsApi && typeof this.origin.eventsApi === "object"))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(route in methods)
			return owe(null, {
				closer: data => {
					return methods[route].call(this, data);
				}
			});

		throw expose(new Error(`Events cannot be accessed via method '${route}'.`));
	};
}

function expose(err) {
	return owe.resource(err, {
		expose: true
	});
}

module.exports = eventRouter;
