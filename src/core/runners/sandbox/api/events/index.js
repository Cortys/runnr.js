"use strict";

const events = module.exports = {
	controller: {
		receiver: require("./receiver"),
		connector: require("./connector")
	},
	router: require("./router")
};

require("./clientFixer")(events.controller.receiver);
