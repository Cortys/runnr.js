"use strict";

const events = module.exports = {
	controller: require("./controller"),
	router: require("./router")
};

require("./clientFixer")(events.controller.receiver);
