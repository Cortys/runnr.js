"use strict";

const expose = require("../expose");

const counter = require("../counter")();

const pendingMap = new Map();

const pending = {
	add(api, event, listener, once) {
		if(event === "newListener" || event === "removeListener")
			return Promise.reject(new Error("This event type is not yet supported."));

		const id = counter.count();
		const entry = { event, listener, once };

		pendingMap.set(id, entry);

		return Promise.all([
			new Promise((resolve, reject) => {
				entry.tokenReceiver = { reject, resolve };
			}),
			api.route("addListener").close({ id, event }).then(result => {
				if("token" in entry && entry.token !== result.token)
					throw new Error("The listener handshake was unexpectedly disrupted.");

				entry.object = result.object;
				entry.token = result.token;
			})
		]).then(() => {
			pendingMap.delete(id);

			return entry;
		}, err => {
			pendingMap.delete(id);

			throw err;
		});
	},

	handleAddConfirmation(api, id, token) {
		const entry = pendingMap.get(id);

		if(!entry)
			throw expose(new Error(`Invalid listener id '${id}'.`));

		if("token" in entry && entry.token !== token) {
			entry.tokenReceiver.reject(new Error("The listener handshake was unexpectedly disrupted."));

			return;
		}

		entry.token = token;
		entry.api = api;

		entry.tokenReceiver.resolve();
	}
};

module.exports = pending;
