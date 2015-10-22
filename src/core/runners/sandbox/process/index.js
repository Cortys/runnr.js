"use strict";

const owe = require("owe.js");
const api = require("../api");

const master = api.client(process);

const controller = {
	master,

	init() {
		master.then(runner => console.log(`Hi, my name is ${runner.name} and I'm ${runner.active ? "active" : "inactive"}!`));
	},

	greeting: "Hello!"
};

controller.init();

owe(controller, owe.serve({
	router: {
		filter: new Set(["greeting"])
	}
}));

// Expose the controller's API to master:
api.server(process, owe.api(controller));
