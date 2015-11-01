"use strict";

const expose = require("../expose");

const Listener = {

	/**
	 * Creates an event listener that will be used in the given listenerMap.
	 * @param {ListenerMap} listenerMap The ListenerMap instance this listener will be stored in.
	 * @param {string} event The event this listener will be listening for.
	 * @return {function} A new event listener.
	 */
	create(listenerMap, event) {
		return Object.assign(function oweEventListener() {
			const args = [...arguments];

			for(const entry of oweEventListener.apis) {
				const api = entry[0];
				const idsMap = entry[1];
				const ids = [];
				const removed = [];

				idsMap.forEach(idEntry => {
					const id = idEntry[0];
					const once = idEntry[1];

					ids.push(id);

					if(once) {
						idsMap.delete(id);
						removed.push(id);
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

				return !ids ? [] : [...ids.keys()];
			},

			idCountForApi(api) {
				const ids = this.apis.get(api);

				return !ids ? 0 : ids.size;
			},

			addToApi(api, id, once) {
				if(!Number.isInteger(id))
					throw expose(new Error(`Listener ids have to be integers.`));

				if(!api.connected)
					throw expose(new Error("Only connected clients can listen for events."));

				const ids = this.apis.get(api);

				if(!ids)
					this.apis.set(api, new Map([
						[id, once]
					]));
				else {
					if(ids.has(id))
						throw expose(new Error(`A listener with id ${id} was already added.`));

					ids.set(id, once);
				}
			},

			removeAllFromApi(api, dontNotifyApi) {
				const ids = this.apis.get(api);

				if(!ids)
					return false;

				this.apis.delete(api);

				if(this.apis.size === 0)
					listenerMap.delete(event);

				if(dontNotifyApi)
					return ids;

				if(ids.size > 0 && api.connected)
					api.close({
						removed: ids
					});

				return ids.size > 0;
			},

			removeFromApi(api, id) {
				const ids = this.apis.get(api);

				if(!ids)
					return false;

				const res = ids.delete(id);

				if(ids.size === 0)
					this.apis.delete(api);

				if(this.apis.size === 0)
					listenerMap.delete(event);

				if(res && api.connected)
					api.close({
						removed: [id]
					});

				return res;
			}
		});
	}
};

module.exports = Listener;
