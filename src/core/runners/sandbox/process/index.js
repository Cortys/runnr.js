"use strict";

const EventEmitter = require("events");

const owe = require("owe.js");
const api = require("../api");
const events = require("../api/events");

const master = api.client(process);

const controller = {
	master,
	eventController: events.controller,

	init() {
		master.route("runner").then(runner => console.log(`Hi, my name is ${runner.name} and I'm ${runner.active ? "active" : "inactive"}!`));

		const emitter = new EventEmitter();

		owe(emitter, events.router());

		this.emitter = emitter;

		setInterval(() => emitter.emit("test", Date.now()), 4);
	},

	get greeting() {
		return `Hello, it's weekday ${new Date().getDay()}`;
	}
};

controller.init();

owe(controller, owe.serve({
	router: {
		filter: new Set(["greeting", "emitter", "eventController"])
	}
}));

// Expose the controller's API to master:
api.server(process, owe.api(controller));
