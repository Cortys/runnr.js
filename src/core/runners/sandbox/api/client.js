"use strict";

const oweClient = require("owe-client");

const requests = new Map();

let idCount = 0;

module.exports = target => {
	function request(route, data) {
		return new Promise((resolve, reject) => {
			const id = idCount++;

			requests.set(id, {
				resolve,
				reject
			});

			target.send({
				type: "owe",
				request: true,
				id, route, data
			});

			setTimeout(() => {
				requests.delete(id);
				reject(new Error("The controller did not respond in time."));
			}, 10000);
		});
	}

	target.on("message", msg => {
		if(!msg || typeof msg !== "object" || msg.type !== "owe" || msg.request)
			return;

		const request = requests.get(msg.id);

		if(!request)
			return;

		requests.delete(msg.id);
		request[msg.error ? "reject" : "resolve"](msg.response);
	});

	return oweClient(request);
};
