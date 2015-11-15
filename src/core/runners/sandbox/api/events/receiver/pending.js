"use strict";

const counter = require("../counter")();

const pendingMap = new Map();

const pending = {
	add(api, event, listener, once) {
		const id = counter.count();
		const entry = { event, listener, once };

		pendingMap.set(id, entry);

		return Promise.all([
			new Promise((reject, resolve) => {
				entry.tokenReceiver = { reject, resolve };
			}),
			api.route("addListener").close({ id, event }).then(result => {
				if("token" in entry && entry.token !== result.token)
					throw new Error("The listener handshake was unexpectedly disrupted.");

				entry.object = result.object;
				entry.token = result.token;
			})
		]).then(() => undefined, err => {
			pendingMap.delete(id);

			throw err;
		});
	},

	handleAddConfirmation(confirmation) {
		
	}
};

module.exports = pending;
