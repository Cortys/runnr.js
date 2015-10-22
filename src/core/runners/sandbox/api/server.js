"use strict";

const owe = require("owe.js");

module.exports = (target, api) => {
	api = api.origin({
		sandbox: true
	});

	target.on("message", msg => {
		if(!msg || typeof msg !== "object" || msg.type !== "owe" || !msg.request)
			return;

		let response = api;

		msg.route.forEach(route => response = response.route(route));

		response.close(msg.data).then(response => ({
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
