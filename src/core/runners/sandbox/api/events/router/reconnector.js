"use strict";

const owe = require("owe-core");
const expose = require("../expose");

const listeningApis = require("./listeningApis");

function createReconnector() {
	const eventEmitterToListeners = new Map();
	const apiToIds = new Map();

	const servedReconnector = {
		addListener(api, eventEmitter, event, id, once) {
			if(!Number.isInteger(id))
				throw expose(new Error(`Listener ids have to be integers.`));

			if(!api.connected)
				throw expose(new Error("Only connected clients can listen for events."));

			const entry = {
				id,
				once,
				eventEmitter,
				event,
				api
			};

			// Add listener to ClientApi based map first, because it stores listeners mapped by id.
			// Thus it can throw if the same id is registered twice for the same ClientApi.

			// Add to ClientApi based map:
			let apiIds = apiToIds.get(api);

			if(!apiIds) {
				apiIds = new Map();
				apiToIds.set(api, apiIds);

				// Add reconnector to the listeningApis map.
				// This causes this.removeAllFromApi(api) to be called if api disconnects:
				listeningApis.addListener(api, this);
			}
			else if(apiIds.has(id))
				throw expose(new Error(`A listener with id ${id} was already added.`));

			apiIds.set(id, entry);

			// Add to EventEmitter#id based map:
			let eventEmitterListeners = eventEmitterToListeners.get(eventEmitter);

			if(!eventEmitterListeners) {
				eventEmitterListeners = new Map();
				eventEmitterToListeners.set(eventEmitter, eventEmitterListeners);
			}

			let eventEmitterIds = eventEmitterListeners.get(event);

			if(!eventEmitterIds) {
				eventEmitterIds = new Set();
				eventEmitterListeners.set(event, eventEmitterIds);
			}

			eventEmitterIds.add(entry);
		},

		takeAllFromEventEmitterEvent(eventEmitter, event) {
			const eventEmitterListeners = eventEmitterToListeners.get(eventEmitter);

			if(!eventEmitterListeners)
				return [];

			const eventEmitterIds = eventEmitterListeners.get(event);

			if(!eventEmitterIds)
				return [];

			eventEmitterListeners.delete(event);

			if(eventEmitterListeners.size === 0)
				eventEmitterToListeners.delete(eventEmitter);

			for(const entry of eventEmitterIds)
				this.removeFromApi(entry.api, entry.id, true);

			return eventEmitterIds;
		},

		removeAllFromApi(api, dontNotifyApi) {
			const apiIds = apiToIds.get(api);

			if(!apiIds)
				return false;

			apiToIds.delete(api);
			listeningApis.removeListener(api, this);

			if(dontNotifyApi)
				return apiIds;

			if(apiIds.size > 0 && api.connected)
				api.close({
					remove: [...apiIds.keys()]
				});

			return apiIds.size > 0;
		},

		removeFromApi(api, id, dontDeleteFromEventMap) {
			const apiIds = apiToIds.get(api);

			if(!apiIds)
				return false;

			const entry = apiIds.get(id);

			if(!entry)
				return false;

			apiIds.delete(entry);

			if(apiIds.size === 0) {
				apiToIds.delete(api);
				listeningApis.removeListener(api, this);
			}

			if(dontDeleteFromEventMap)
				return true;

			const eventEmitterListeners = eventEmitterToListeners.get(entry.eventEmitter);
			const eventEmitterIds = eventEmitterListeners && eventEmitterListeners.get(entry.event);

			if(eventEmitterIds)
				eventEmitterIds.delete(entry);

			if(api.connected)
				api.close({
					remove: [id]
				});

			return true;
		}
	};

	return owe(servedReconnector, {
		closer(requests) {
			if(!owe.client.isApi(this.origin.eventsApi))
				throw expose(new Error(`Events cannot be accessed via this protocol.`));

			if(!Array.isArray(requests))
				throw expose(new TypeError("EventListener reconnectors require an array of listener requests."));

			const api = this.origin.eventsApi;

			for(const request of requests)
				servedReconnector
					.addListener(api, request.eventEmitter, request.event, request.id, request.method === "once");
		}
	});
}

module.exports = createReconnector();
