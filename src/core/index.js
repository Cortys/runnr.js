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
				console.error("Failed to exit runnr core.", err.stack);
				throw err;
			});
		}
	}, owe.serve({
		router: {
			filter: new Set(["plugins", "runners"])
		}
	}));
}, err => {
	console.error("Loading DB failed.", err.stack);
});
