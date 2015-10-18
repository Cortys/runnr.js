"use strict";

const requests = new Map();

let idCount = 0;

function request(route, data) {
	return new Promise((resolve, reject) => {
		const id = idCount++;

		requests.set(id, {
			resolve,
			reject
		});

		process.send({
			type: "owe",
			id, route, data
		});

		setTimeout(() => {
			requests.delete(id);
			reject(new Error("The controller did not respond in time."));
		}, 10000);
	});
}

process.on("message", msg => {
	if(!msg || typeof msg !== "object" || msg.type !== "owe")
		return;

	const request = requests.get(msg.id);

	if(!request)
		return;

	requests.delete(msg.id);
	request[msg.error ? "reject" : "resolve"](msg.response);
});

module.exports = request;
