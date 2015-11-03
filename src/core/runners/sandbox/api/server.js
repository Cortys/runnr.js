"use strict";

const owe = require("owe.js");

const client = require("./client");

module.exports = (target, api) => {
	api = api.origin({
		sandbox: true,
		eventsApi: client(target).route("receiver")
	});

	target.on("message", msg => {
		if(!msg || typeof msg !== "object" || msg.type !== "owe" || !msg.request)
			return;

		api.route(...msg.route).close(msg.data).then(response => ({
			response
		}), error => ({
			response: owe.isExposed(error) ? Object.defineProperty(error, "message", {
				enumerable: true,
				value: error.message
			}) : error,
			error: true
		})).then(response => target.send(Object.assign({
			type: "owe",
			request: false,
			id: msg.id
		}, response)));
	});
};
