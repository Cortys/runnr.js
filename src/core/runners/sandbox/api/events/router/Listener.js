"use strict";

const expose = require("../expose");

const listeningApis = require("./listeningApis");
const reconnector = require("./reconnector");

const Listener = {

	/**
	 * Creates an event listener that will be used in the given listenerMap.
	 * @param {EventEmitter} eventEmitter The ListenerMap instance this listener will be stored in.
	 * @param {string} event The event this listener will be listening for.
	 * @return {function} A new event listener.
	 */
	create(eventEmitter, event) {
		return Object.assign(function oweEventListener() {
			const args = [...arguments];

			oweEventListener.reconnect();

			for(const entry of oweEventListener.apis) {
				const api = entry[0];
				const idsMap = entry[1];
				const call = [];
				const removeThenCall = [];

				for(const idEntry of idsMap) {
					const id = idEntry[0];
					const once = idEntry[1];

					if(once) {
						idsMap.delete(id);
						removeThenCall.push(id);
					}
					else
						call.push(id);
				}

				api.close({
					call,
					removeThenCall,
					arguments: args
				});
			}
		}, {
			apis: new Map(),

			reconnect() {
				const reconnectListeners = reconnector.takeAllFromEventEmitterEvent(eventEmitter, event);

				for(const entry of reconnectListeners)
					this.addToApi(entry.api, entry.id, entry.once, true);
			},

			idsForApi(api) {
				this.reconnect();

				const ids = this.apis.get(api);

				return !ids ? [] : [...ids.keys()];
			},

			idCountForApi(api) {
				this.reconnect();

				const ids = this.apis.get(api);

				return !ids ? 0 : ids.size;
			},

			addToApi(api, id, once, dontThrow) {
				if(!Number.isInteger(id)) {
					if(dontThrow)
						return;
					throw expose(new Error(`Listener ids have to be integers.`));
				}

				if(!api.connected) {
					if(dontThrow)
						return;
					throw expose(new Error("Only connected clients can listen for events."));
				}

				let ids = this.apis.get(api);

				if(!ids) {
					ids = new Map();
					this.apis.set(api, ids);
					listeningApis.addListener(api, this);
				}
				else if(ids.has(id)) {
					if(dontThrow)
						return;
					throw expose(new Error(`A listener with id ${id} was already added.`));
				}

				ids.set(id, once);
			},

			removeAllFromApi(api, dontNotifyApi) {
				const ids = this.apis.get(api) || new Map();
				const reconnectListeners = reconnector.removeAllFromApi(api, true) || new Map();

				if(ids.size === 0 && reconnectListeners.size === 0)
					return false;

				this.apis.delete(api);
				listeningApis.removeListener(api, this);

				if(dontNotifyApi)
					return [...ids.keys(), ...reconnectListeners.keys()];

				if(api.connected)
					api.close({
						remove: [...ids.keys(), ...reconnectListeners.keys()]
					});

				return true;
			},

			removeFromApi(api, idCandidates) {
				this.reconnect();

				const ids = this.apis.get(api);

				if(!ids)
					return false;

				let res = false,
					id;

				// Remove the first id found in idCandidates:
				for(id of idCandidates)
					if((res = ids.delete(id)))
						break;

				if(ids.size === 0) {
					this.apis.delete(api);
					listeningApis.removeListener(api, this);
				}

				if(res && api.connected)
					api.close({
						remove: [id]
					});

				return res;
			}
		});
	}
};

module.exports = Listener;
