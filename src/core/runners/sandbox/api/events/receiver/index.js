"use strict";

const owe = require("owe-core");
const expose = require("../expose");

function* counter() {
	let position = 0;

	while(true) {
		if(!Number.isSafeInteger(position))
			position = 0;

		yield position++;
	}
}

function receiver() {
	const count = counter();
	const ids = new Map();
	const listeners = new WeakMap();

	const servedReceiver = {
		add(listener) {
			const id = count.next().value;

			ids.set(id, listener);
			listeners.set(listener, id);

			return id;
		}

		remove(listener) {

		}
	};

	return owe(servedReceiver, undefined, data => {
		if(!data || typeof data !== "object")
			throw expose(new TypeError("Event receivers require objects."));

		if(Array.isArray(data.removed))
			data.removed.forEach(id => servedReceiver.remove(id));
	});
}

module.exports = receiver;
