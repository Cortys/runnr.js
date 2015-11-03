"use strict";

const ClientApi = require("owe-core/src/ClientApi.js");

module.exports = receiver => {
	function add(event, listener, method) {
		const id = receiver.add(event, listener, () => {}, method);

		return this.route(method).close({ event, id });
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
			return this.route("listeners").close(event);
		},
		listenerCount(event) {
			return this.route("listenerCount").close(event);
		}
	});

	ClientApi.prototype.addListener = ClientApi.prototype.on;
};
