"use strict";

const owe = require("owe-core");
const expose = require("../expose");
const generating = require("../generatingMaps");

const pending = require("./pending");
const listeners = require("./listeners");

const connectorApis = new generating.WeakMap(api => api.route("connector"));

const idToListener = Object.assign(new Map(), {
	counter: require("../counter")(),

	put(listener) {
		const id = this.counter.count();

		this.set(id, listener);

		return id;
	}
});

const receiver = {
	add(api, event, listener, once) {
		return pending.add(api, event, listener, once)
			.then(entry => listeners.add(entry));
	},

	addListener(api, event, listener) {
		return this.add(api, event, listener, false);
	},

	once(api, event, listener) {
		return this.add(api, event, listener, true);
	},

	removeListener(api, event, listener) {
		const id = idToListener.put(listener);

		return api.route("removeListener").close({
			clientOnly: true,
			event,
			listener: id
		}).then(data => {
			idToListener.delete(id);

			return data;
		}, err => {
			idToListener.delete(id);

			throw err;
		});
	},

	removeAllListeners(api, event) {

	},

	listeners(api, event) {

	},

	listenerCount(api, event) {

	}
};

const messageHandlers = {
	__proto__: null,

	addConfirmation(api, data) {
		pending.handleAddConfirmation(api, data.id, data.token);
	},

	emit(api, data) {
		listeners.call({
			api,
			object: data.object,
			event: data.event
		}, data.args);
	},

	remove(api, data) {
		return listeners.remove({
			api,
			object: data.object,
			event: data.event
		}, idToListener.get(data.listener));
	}
};

owe(receiver, {
	closer(data) {
		if(!owe.client.isApi(this.origin.eventsApi))
			throw expose(new Error(`Events cannot be accessed via this protocol.`));

		if(!data || typeof data !== "object" || !(data.type in messageHandlers))
			throw expose(new TypeError("Invalid message."));

		return messageHandlers[data.type](connectorApis.get(this.origin.eventsApi), data);
	}
});

require("./clientFixer")(receiver);

module.exports = receiver;
