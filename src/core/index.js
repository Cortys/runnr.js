"use strict";

const owe = require("owe.js");
const store = require("./store");

module.exports = store.loaded.then(() => {

	console.log("DB loaded.");

	return owe({
		plugins: require("./plugins"),
		runners: require("./runners"),

		onExit() {
			return store.exit().then(() => {
				console.log("DB saved.");
				console.log("Exiting runnr core.");
			}, err => {
				console.log("Failed to exit runnr core.", err);
				throw err;
			});
		}
	}, owe.serve());
}, err => {
	console.error("Loading DB failed.");
	console.error(err.stack);
});
