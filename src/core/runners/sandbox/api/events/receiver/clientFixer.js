"use strict";

const ClientApi = require("owe-core/src/ClientApi.js");

Object.assign(ClientApi.prototype, {
	on() {},
	once() {},
	removeListener() {},
	removeAllListeners() {},
	listeners() {},
	listenerCount() {}
});

ClientApi.prototype.addListener = ClientApi.prototype.on;
