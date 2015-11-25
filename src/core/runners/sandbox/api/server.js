"use strict";

const owe = require("owe.js");

module.exports = (target, api, options) => {
	if(typeof options !== "object" || options === null)
		options = {};

	options = {
		origin: options.orign || {}
	};

	api = api.origin(Object.assign({
		sandbox: true
	}, options.origin));

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
