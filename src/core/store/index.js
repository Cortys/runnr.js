"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = new Loki(config.fromUserData("store.db"), {
	autosave: true
});

store.loaded = new Promise((resolve, reject) => {
	store.loadDatabase({}, () => {
		resolve(store);
	});
});

module.exports = store;
