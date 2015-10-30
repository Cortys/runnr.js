"use strict";

const owe = require("owe.js");

const requests = new Map();

let idCount = 0;

module.exports = target => {
	function init() {
		target.on("message", msg => {
			if(!msg || typeof msg !== "object" || msg.type !== "owe" || msg.request)
				return;

			const request = requests.get(msg.id);

			if(!request)
				return;

			requests.delete(msg.id);
			request[msg.error ? "reject" : "resolve"](msg.response);
		});

		target.on("exit", () => this.emit("disconnect"));
	}

	function closer(route, data) {
		return new Promise((resolve, reject) => {
			if(!Number.isSafeInteger(idCount))
				idCount = 0;

			const id = idCount++;

			requests.set(id, { resolve, reject });

			target.send({
				type: "owe",
				request: true,
				id, route, data
			});

			setTimeout(() => {
				requests.delete(id);
				reject(new Error("The API did not respond in time."));
			}, 10000);
		});
	}

	return owe.client({ init, closer });
};
