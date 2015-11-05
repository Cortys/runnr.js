"use strict";

const ClientApi = require("owe-core/src/ClientApi");

module.exports = receiver => {
	function add(event, listener, method) {
		if(event === "newListener" || event === "removeListener")
			return this.route(method).close({ event })
				.then(data => receiver.add(event, listener, method, data.eventEmitter));

		const id = receiver.add(event, listener, method);

		return this.route(method).close({ event, id })
			.then(
				data => receiver.addToId(id, data.eventEmitter),
				err => {
					receiver.remove(id);

					throw err;
				}
			);
	}

	Object.assign(ClientApi.prototype, {
		on(event, listener) {
			return add.call(this, event, listener, "on");
		},
		once(event, listener) {
			return add.call(this, event, listener, "once");
		},
		removeListener(event, listener) {
			return this.route("removeListener").close({
				event,
				idCandidates: receiver.getIds(listener)
			});
		},
		removeAllListeners(event) {
			return this.route("removeAllListeners").close(event || null);
		},
		listeners(event) {
			return this.route("listeners").close(event)
				.then(receiver.getListeners);
		},
		listenerCount(event) {
			return this.route("listenerCount").close(event);
		}
	});

	ClientApi.prototype.addListener = ClientApi.prototype.on;
};
