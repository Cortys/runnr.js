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

	const servedReceiver = {
		add(listener) {
			const id = count.next().value;

			ids.set(id, listener);

			return id;
		},

		remove(id) {
			ids.delete(id);
		},

		call(id, args) {
			const listener = ids.get(id);

			if(!listener)
				return;

			listener.apply(undefined, args);
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
