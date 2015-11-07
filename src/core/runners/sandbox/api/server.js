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
			response: error,
			error: true
		})).then(responseMsg => Object.assign({
			type: "owe",
			request: false,
			id: msg.id
		}, responseMsg)).then(responseMsg => {
			responseMsg.response = JSON.stringify(responseMsg.response,
				(key, value) => owe.isExposed(value) ? owe.exposed.value(value) : value);

			target.send(responseMsg);
		});
	});
};
