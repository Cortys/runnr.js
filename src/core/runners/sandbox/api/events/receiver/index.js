"use strict";

const owe = require("owe-core");
const expose = require("../expose");

require("./clientFixer");

function* counter() {
	let position = 0;

	while(true) {
		if(!Number.isSafeInteger(position) || position === -1)
			position = Number.MIN_SAFE_INTEGER;

		yield position++;
	}
}

function receiver() {
	const count = counter();
	const ids = new Map();

	const servedReceiver = {
		add(listener, removeListener) {
			const id = count.next().value;

			ids.set(id, { listener, removeListener });

			return id;
		},

		remove(id) {
			const listeners = ids.get(id);

			if(!listeners)
				return false;

			ids.delete(id);
			listeners.removeListener(id);
		},

		call(id, args) {
			const listeners = ids.get(id);

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

module.exports = receiver;
