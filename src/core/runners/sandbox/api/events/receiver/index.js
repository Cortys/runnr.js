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
	const idToListenerInfos = new Map();
	const listenerToIds = new WeakMap();
	const eventEmitterToListeners = new Map();

	const servedReceiver = {
		add(event, listener, method, eventEmitter) {
			if(event === "newListener" || event === "removeListener") {
				let listeners = eventEmitterToListeners.get(eventEmitter);

				if(!listeners) {
					listeners = {
						newListener: [],
						removeListener: []
					};
					eventEmitterToListeners.set(eventEmitter, listeners);
				}

				listeners.newListener = listeners.newListener.filter(existingListener => {
					existingListener.listener.call(undefined, event, listener);

					return existingListener.method !== "once";
				});

				listeners[event].push({ listener, method });

				return;
			}

			const id = count.next().value;

			idToListenerInfos.set(id, {
				event,
				listener,
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
			const listenerInfo = idToListenerInfos.get(id);

			if(!listenerInfo)
				return;

			listenerInfo.eventEmitter = eventEmitter;

			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(listeners) {
				listeners.newListener = listeners.newListener.filter(listener => {
					listener.listener.call(undefined, listenerInfo.event, listenerInfo.listener);

					return listener.method !== "once";
				});
			}
		},

		remove(id) {
			const listenerInfo = idToListenerInfos.get(id);

			if(!listenerInfo)
				return false;

			idToListenerInfos.delete(id);
			listenerToIds.get(listenerInfo.listener).delete(id);

			const listeners = eventEmitterToListeners.get(listenerInfo.eventEmitter);

			if(listeners) {
				listeners.removeListener = listeners.removeListener.filter(listener => {
					listener.listener.call(undefined, listenerInfo.event, listenerInfo.listener);

					return listener.method !== "once";
				});
			}
		},

		getIds(listener) {
			const ids = listenerToIds.get(listener);

			return ids ? [...ids] : [];
		},

		getListeners(ids) {
			const result = [];

			for(const id of ids) {
				const listeners = idToListenerInfos.get(id);

				if(listeners)
					result.push(listeners.listener);
			}

			return result;
		},

		call(id, args) {
			const listeners = idToListenerInfos.get(id);

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
