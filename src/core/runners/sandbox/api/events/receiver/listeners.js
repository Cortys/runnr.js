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

const callDelayers = new generating.Map(() => new Set());

const listeners = {
	add(entry) {
		this.call({
			api: entry.api,
			object: entry.object,
			event: "newListener"
		}, [entry.event, entry.listener]);

		apis.get(entry.api).get(entry.object).get(entry.event).add({
			listener: entry.listener,
			once: entry.once
		});
	},

	getListeners(entry) {
		return apis.maybeLookup(entry.api).maybeLookup(entry.object).lookup(entry.event);
	},

	remove(entry) {
		const listeners = this.getListeners(entry);

		if(!listeners)
			return false;

		for(const listenerMeta of listeners)
			if(listenerMeta.listener === entry.listener)
				return this.removeSpecific(entry, listenerMeta);

		return false;
	},

	removeAll(entry) {
		const api = apis.lookup(entry.api);

		if(!api)
			return false;

		if(entry.event == null)
			return api.delete(entry.object);

		const object = api.lookup(entry.object);

		if(!object)
			return false;

		// removeAll removes all listeners for the given event without notifying the server
		// since all removeAll calls occur as a reaction to the server removing the event.
		return object.delete(entry.event);
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

			entry.api.close({
				type: "remove",
				object: entry.object,
				event: entry.event
			});
		}

		this.call({
			api: entry.api,
			object: entry.object,
			event: "removeListener"
		}, [entry.event, listenerMeta.listener]);

		return res;
	},

	call(entry, args) {
		const listeners = this.getListeners(entry);

		if(!listeners)
			return;

		const delayers = this.getCallDelayers(entry.event);

		if(delayers.length > 0) {
			delayers.then(() => this.call(entry, args));

			return;
		}

		for(const listenerMeta of listeners) {
			if(listenerMeta.once)
				this.removeSpecific(entry, listenerMeta);

			listenerMeta.listener.apply(undefined, args);
		}
	},

	addCallDelayer(event, delayer) {

		if(event === undefined)
			event = null;

		const destructor = () => {
			const delayers = callDelayers.lookup(event);

			if(!delayers)
				return;

			delayers.delete(selfDestructingDelayer);

			if(delayers.size === 0)
				callDelayers.delete(event);
		};

		const selfDestructingDelayer = delayer.then(destructor, destructor);

		callDelayers.get(event).add(selfDestructingDelayer);

		return delayer;
	},

	getCallDelayers(event) {
		const delayers = callDelayers.lookup(event) || [];
		const globalDelayers = callDelayers.lookup(null) || [];

		return [...delayers, ...globalDelayers];
	}
};

module.exports = listeners;
