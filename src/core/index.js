"use strict";

const owe = require("owe.js");

module.exports = owe({
	start() {
		this.store = require("./store");

		return this.store.loaded.then(() => {
			console.log("DB loaded.");

			Object.assign(this, {
				plugins: require("./plugins"),
				runners: require("./runners"),
			});
		}, err => {
			console.error("Loading DB failed.", err.stack);
		});
	},

	stop() {
		if(!this.store)
			throw new Error("Core cannot be stopped before it was started.");

		return this.store.stop().then(() => {
			console.log("DB saved.");
			console.log("Exiting runnr core.");
		}, err => {
			console.error("Failed to stop runnr core.", err.stack);
			throw err;
		});
	}
}, owe.serve({
	router: {
		filter: owe.filter(new Set(["plugins", "runners"]))
	}
}));
