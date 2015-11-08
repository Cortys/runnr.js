"use strict";

const ClientApi = require("owe-core/src/ClientApi");

module.exports = receiver => {
	function add(event, listener, method) {
		if(event === "newListener" || event === "removeListener")
			return this.route(method).close({ event })
				.then(data => receiver.addListener(event, listener, method, data.eventEmitter));

		const id = receiver.addListener(event, listener, method);

		return this.route(method).close({ event, id })
			.then(data => receiver.addEventEmitterToId(id, data.eventEmitter), err => {
				receiver.removeListener(id);

				throw err;
			});
	}

	Object.assign(ClientApi.prototype, {
		on(event, listener) {
			return add.call(this, event, listener, "on");
		},

		once(event, listener) {
			return add.call(this, event, listener, "once");
		},

		removeListener(event, listener) {
			if(event === "newListener" || event === "removeListener") {
				const result = this.route("removeListener").close({ event });

				receiver.addListenerCallDelayer(listener, result);

				return result.then(data => receiver.removeMetaListener(event, listener, data.eventEmitter));
			}

			const idCandidates = receiver.getListenerIds(listener);

			if(!idCandidates)
				return Promise.resolve(false);

			const result = this.route("removeListener").close({
				event,
				idCandidates
			});

			receiver.addListenerCallDelayer(listener, result);

			return result.then(data => data.removed);
		},

		removeAllListeners(event) {
			const result = this.route("removeAllListeners").close(event);

			receiver.addListenerCallDelayer(null, result);

			return result.then(data => receiver.removeAllMetaListeners(event, data.eventEmitter) || data.removed);
		},

		listeners(event) {
			return this.route("listeners").close(event)
				.then(data => {
					if(event === "newListener" || event === "removeListener")
						return receiver.getMetaListeners(event, data.eventEmitter);

					return receiver.getListeners(data.listeners);
				});
		},

		listenerCount(event) {
			return this.route("listenerCount").close(event)
				.then(data => {
					if(event === "newListener" || event === "removeListener")
						return receiver.getMetaListenersCount(event, data.eventEmitter);

					return data.count;
				});
		}
	});

	ClientApi.prototype.addListener = ClientApi.prototype.on;
};
