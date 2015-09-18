"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = new Loki(config.fromUserData("store.db"), {
	autosave: true
});

store.loaded = new Promise(resolve => store.loadDatabase({}, () => resolve(store)));

store.exit = function exit() {
	return new Promise(resolve => store.close(() => {
		console.log("DB saved.");
		resolve();
	}));
};

module.exports = store;
