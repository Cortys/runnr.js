"use strict";

const generating = require("../generatingMaps");

// ClientApi => event emitting objects:
const apis = new generating.WeakMap(
	// event emitting object => events:
	() => new generating.Map(
		// event => set of listeners:
		() => new generating.Map(
			// Every listener is stored as an object of the form { listener: [fn], once: [bool] }.
			() => new Set()
		)
	)
);

const listeners = {
	add(entry) {
		apis.get(entry.api).get(entry.object).get(entry.event).add({
			listener: entry.listener,
			once: entry.once
		});
	},

	getListeners(entry) {
		return apis.maybeLookup(entry.api).maybeLookup(entry.object).lookup(entry.event);
	},

	remove(entry, listener) {
		const listeners = this.getListeners(entry);

		if(!listeners)
			return false;

		for(const listenerMeta of listeners)
			if(listenerMeta.listener === listener)
				return this.removeSpecific(entry, listenerMeta);

		return false;
	},

	removeSpecific(entry, listenerMeta) {
		const api = apis.lookup(entry.api);

		if(!api)
			return false;

		const object = api.lookup(entry.object);

		if(!object)
			return false;

		const listeners = object.lookup(entry.event);

		if(!listeners)
			return false;

		const res = listeners.delete(listenerMeta);

		if(listeners.size === 0) {
			object.delete(entry.event);
		}

		return res;
	},

	call(entry, args) {
		const listeners = this.getListeners(entry);

		if(!listeners)
			return;

		for(const listenerMeta of listeners) {
			if(listenerMeta.once)
				this.removeSpecific(entry, listenerMeta);

			listenerMeta.listener.apply(undefined, args);
		}
	}
};

module.exports = listeners;
