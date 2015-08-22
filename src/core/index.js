"use strict";

module.exports = require("./store").loaded.then(function() {

	console.log("DB loaded.");

	return {
		plugins: require("./plugins"),
		runners: require("./runners")
	};
}, function(err) {
	console.error("Loading DB failed.", err);
});
