"use strict";

const owe = require("owe-core");

module.exports = {
	controller: owe({
		__proto__: null,

		receiver: require("./receiver"),
		connector: require("./connector")
	}, {
		router(route) {
			if(route in this.value)
				return this.value[route];
		}
	}),
	router: require("./router")
};
