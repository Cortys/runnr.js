"use strict";

const owe = require("owe-core");
const expose = require("./expose");

const controller = {
	__proto__: null,

	receiver: require("./receiver"),
	reconnector: require("./router/reconnector")
};

module.exports = owe(null, {
	router() {
		return controller.receiver;

		/* if(controller[route])
			return controller[route];

		throw expose(new Error("Invalid event controller route."));*/
	}
});
