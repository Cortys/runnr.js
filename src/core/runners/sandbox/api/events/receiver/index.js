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

	// Stores listeners for meta events (newListener, removeListener)
	// and maps them to eventEmitter ids:
	const eventEmitterToListeners = new Map();

	// Stores a set of Promises for each listener that have to be resolved calling it.
	// Used to delay listeners that might be removed by a removeListener call
	// that already took place but did not complete yet.
	const listenerToCallDelayers = new WeakMap();

	// A set of Promises that have to be resolved before any listener is called:
	const globalDelayers = new Set();

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

				this.callMetaListeners(
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

			this.callMetaListeners(
				"newListener",
				[listenerInfo.event, listenerInfo.listener],
				eventEmitter
			);
		},

		addListenerCallDelayer(listener, delayer) {
			let delayers;

			if(typeof listener === "function") {
				delayers = listenerToCallDelayers.get(listener);

				if(!delayers) {
					delayers = new Set();

					listenerToCallDelayers.set(listener, delayers);
				}
			}
			else
				delayers = globalDelayers;

			const reaction = () => delayers.delete(selfDestructingDelayer);
			const selfDestructingDelayer = delayer.then(reaction, reaction);

			delayers.add(selfDestructingDelayer);
		},

		removeListener(id) {
			const listenerInfo = idToListenerInfo.get(id);

			if(!listenerInfo)
				return;

			idToListenerInfo.delete(id);
			listenerToIds.get(listenerInfo.listener).delete(id);

			this.callMetaListeners(
				"removeListener",
				[listenerInfo.event, listenerInfo.listener],
				listenerInfo.eventEmitter
			);

			return listenerInfo.listener;
		},

		removeMetaListener(event, listener, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return false;

			let i;

			if(typeof listener === "object") {
				i = listeners[event].indexOf(listener);
				listener = listener.listener;
			}
			else
				i = listeners[event].findIndex(listenerInfo => listenerInfo.listener === listener);

			if(i < 0)
				return false;

			listeners[event].splice(i, 1);
			this.callMetaListeners(
				"removeListener",
				[event, listener],
				eventEmitter
			);

			return true;
		},

		removeAllMetaListeners(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners)
				return false;

			const listenersForEvent = listeners[event];

			if(!listenersForEvent || !listenersForEvent.length)
				return false;

			listeners[event] = [];

			listenersForEvent.forEach(listener => this.callMetaListeners(
				"removeListener",
				[event, listener.listener],
				eventEmitter
			));
		},

		getListenerIds(listener) {
			return [...listenerToIds.get(listener)];
		},

		getListener(id) {
			return idToListenerInfo.get(id);
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

		getMetaListeners(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return [];

			return listeners[event].map(listener => listener.listener);
		},

		getMetaListenersCount(event, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return 0;

			return listeners[event].length;
		},

		getDelayersForListener(listener) {
			const delayers = listenerToCallDelayers.get(listener);

			if(!delayers)
				return [...globalDelayers];

			return [...globalDelayers, ...delayers];
		},

		callMetaListeners(event, args, eventEmitter) {
			const listeners = eventEmitterToListeners.get(eventEmitter);

			if(!listeners || !listeners[event])
				return;

			const that = this;
			const removed = [];
			let done = false;

			listeners[event] = listeners[event].filter(function callMetaListener(listener, index) {
				// Do nothing if this listener was already removed when trying to call it:
				if(done && (index = listeners[event].lastIndexOf(listener, index)) < 0)
					return;

				const delayers = that.getDelayersForListener(listener.listener);

				if(delayers.length) {
					Promise.all(delayers).then(() => callMetaListener(listener, index));

					return true;
				}

				listener.listener.apply(undefined, args);

				if(listener.method !== "once")
					return true;

				if(!done)
					removed.push(listener.listener);
				else
					that.removeMetaListener(event, listener, eventEmitter);

				return false;
			});

			removed.forEach(listener => this.callMetaListeners(
				"removeListener",
				[event, listener],
				eventEmitter
			));
			done = true;
		},

		callListener(id, args) {
			const listeners = idToListenerInfo.get(id);

			if(!listeners)
				return;

			const delayers = this.getDelayersForListener(listeners.listener);

			if(delayers.length)
				Promise.all(delayers).then(() => this.callListener(id, args));
			else
				listeners.listener.apply(undefined, args);
		},

		removeThenCallListener(id, args) {
			const listener = this.getListener(id);

			if(!listener)
				return;

			const delayers = this.getDelayersForListener(listener);

			if(delayers.length)
				Promise.all(delayers).then(() => this.removeThenCallListener(id, args));
			else {
				this.removeListener(id);
				listener.apply(undefined, args);
			}
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
				data.removeThenCall.forEach(id => servedReceiver.removeThenCallListener(id, data.arguments));
		}
	});
}

const receiver = module.exports = createReceiver();

require("./clientFixer")(receiver);
