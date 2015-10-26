"use strict";

const expose = require("../expose");

module.exports = function createListener(listeners) {
	return Object.assign(function oweEventListener() {
		const args = Array.from(arguments);

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

			return !ids ? [] : Array.from(ids.keys());
		},

		idCountForApi(api) {
			const ids = this.apis.get(api);

			return !ids ? 0 : ids.size;
		},

		addToApi(api, id, once) {
			if(!Number.isInteger(id))
				throw expose(new Error(`Listener ids have to be integers.`));

			const ids = this.apis.get(api);

			if(!ids)
				this.apis.set(api, new Map([[id, once]]));
			else {
				if(ids.has(id))
					throw expose(new Error(`A listener with id ${id} was already added.`));

				ids.set(id, once);
			}
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
};
