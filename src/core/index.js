"use strict";

const owe = require("owe.js");

module.exports = require("./store").loaded.then(() => {

	console.log("DB loaded.");

	return owe({
		plugins: require("./plugins"),
		runners: require("./runners")
	}, owe.serve());
}, err => {
	console.error("Loading DB failed.", err);
});
