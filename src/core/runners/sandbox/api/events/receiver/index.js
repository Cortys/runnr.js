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
	// Generates event listener ids:
	const count = counter();

	// Stores event name, listener function and method ("on" or "once") for each listener id:
	const idToListenerInfo = new Map();

	// Maps every listener function to the listener ids that use it:
	const listenerToIds = new WeakMap();

	// Stores listeners for events that are locally handled (newListener, removeListener)
	// and maps them to eventEmitter ids:
	const eventEmitterToListeners = new Map();

	const servedReceiver = {
		addListener(event, listener, method, eventEmitter) {
			if(event === "newListener" || event === "removeListener") {
				let listeners = eventEmitterToListeners.get(eventEmitter);

				if(!listeners) {
					listeners = {
						newListener: [],
						removeListener: []
					};
					eventEmitterToListeners.set(eventEmitter, listeners);
				}

				this.callLocalListeners(
					"newListener",
					[event, listener],
					eventEmitter
				);

				listeners[event].push({ listener, method });

				return;
			}

			const id = count.next().value;

			idToListenerInfo.set(id, {
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

		addEventEmitterToId(id, eventEmitter) {
			const listenerInfo = idToListenerInfo.get(id);

			if(!listenerInfo)
				return;

			listenerInfo.eventEmitter = eventEmitter;

			this.callLocalListeners(
				"newListener",
				[listenerInfo.event, listenerInfo.listener],
				eventEmitter
			);
		},

		removeListener(id) {
			const listenerInfo = idToListenerInfo.get(id);

			if(!listenerInfo)
				return;

			idToListenerInfo.delete(id);
			listenerToIds.get(listenerInfo.listener).delete(id);

			this.callLocalListeners(
				"removeListener",
				[listenerInfo.event, listenerInfo.listener],
				listenerInfo.eventEmitter
			);

			return listenerInfo.listener;
		},

		removeLocalListener(event, listener, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return false;

			let found = false,
				i;

			for(i = 0; i < listeners[event].length; i++)
				if(listeners[event][i].listener === listener) {
					found = true;
					break;
				}

			if(!found)
				return false;

			listeners[event].splice(i, 1);
			this.callLocalListeners(
				"removeListener",
				[event, listener],
				eventEmitter
			);

			return true;
		},

		removeAllLocalListeners(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners)
				return false;

			const listenersForEvent = listeners[event];

			if(!listenersForEvent || !listenersForEvent.length)
				return false;

			listeners[event] = [];

			listenersForEvent.forEach(listener => this.callLocalListeners(
				"removeListener",
				[event, listener.listener],
				eventEmitter
			));
		},

		getListenerIds(listener) {
			const ids = listenerToIds.get(listener);

			return ids ? [...ids] : [];
		},

		getListeners(ids) {
			const result = [];

			for(const id of ids) {
				const listeners = idToListenerInfo.get(id);

				if(listeners)
					result.push(listeners.listener);
			}

			return result;
		},

		getLocalListeners(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return [];

			return listeners[event].map(listener => listener.listener);
		},

		getLocalListenersCount(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return 0;

			return listeners[event].length;
		},

		callLocalListeners(event, args, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return;

			const removed = [];

			listeners[event] = listeners[event].filter(listener => {
				listener.listener.apply(undefined, args);

				if(listener.method !== "once")
					return true;

				removed.push(listener.listener);

				return false;
			});

			removed.forEach(listener => this.callLocalListener(
				"removeListener",
				[event, listener],
				eventEmitter
			));
		},

		callListener(id, args) {
			const listeners = idToListenerInfo.get(id);

			if(!listeners)
				return;

			listeners.listener.apply(undefined, args);
		},

		removeThenCallListener(id, args) {
			const listener = this.removeListener(id);

			if(!listener)
				return;

			listener.apply(undefined, args);
		}
	};

	return owe(servedReceiver, {
		closer(data) {
			if(!data || typeof data !== "object")
				throw expose(new TypeError("Event receivers require objects."));

			if(Array.isArray(data.call))
				data.call.forEach(id => servedReceiver.callListener(id, data.arguments));

			if(Array.isArray(data.remove))
				data.remove.forEach(id => servedReceiver.removeListener(id));

			// Listeners attached via "once" are removed first
			// (triggering "removeListener" listeners) and then called:
			if(Array.isArray(data.removeThenCall))
				data.call.forEach(id => servedReceiver.removeThenCallListener(id, data.arguments));
		}
	});
}

const receiver = module.exports = createReceiver();

require("./clientFixer")(receiver);
