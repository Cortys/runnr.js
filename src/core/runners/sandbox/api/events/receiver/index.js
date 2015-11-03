"use strict";

const owe = require("owe-core");
const expose = require("../expose");

function* counter() {
	let position = 0;

	while(true) {
		if(!Number.isSafeInteger(position) || position === -1)
			position = Number.MIN_SAFE_INTEGER;

		yield position++;
	}
}

function createReceiver() {
	const count = counter();
	const idToListeners = new Map();
	const listenerToIds = new WeakMap();

	const servedReceiver = {
		add(event, listener, removeListener, method) {
			const id = count.next().value;

			idToListeners.set(id, {
				event,
				listener,
				removeListener,
				method
			});

			let ids = listenerToIds.get(listener);

			if(!ids) {
				ids = new Set();
				listenerToIds.set(listener, ids);
			}

			ids.add(id);

			return id;
		},

		addToId(id, eventEmitter) {
			const listeners = idToListeners.get(id);

			if(!listeners)
				return;

			listeners.eventEmitter = eventEmitter;
		},

		remove(id) {
			const listeners = idToListeners.get(id);

			if(!listeners)
				return false;

			idToListeners.delete(id);
			listeners.removeListener(id);
			listenerToIds.get(listeners.listener).delete(id);
		},

		getIds(listener) {
			const ids = listenerToIds.get(listener);

			return ids ? [...ids] : [];
		},

		call(id, args) {
			const listeners = idToListeners.get(id);

			if(!listeners)
				return;

			listeners.listener(...args);
		}
	};

	return owe(servedReceiver, {
		closer(data) {
			if(!data || typeof data !== "object")
				throw expose(new TypeError("Event receivers require objects."));

			if(Array.isArray(data.ids))
				data.ids.forEach(id => servedReceiver.call(id, data.arguments));

			if(Array.isArray(data.removed))
				data.removed.forEach(id => servedReceiver.remove(id));
		}
	});
}

const receiver = module.exports = createReceiver();

require("./clientFixer")(receiver);
