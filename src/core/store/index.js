"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = new Loki(config.fromUserData("store.db"), {
	autosave: true
});

store.loaded = new Promise(resolve => {
	store.loadDatabase({
		plugins: {
			proto: require("../plugins/Plugin"),
			inflate: (src, dst) => Object.assign(dst, src)
		},
		runners: {
			proto: require("../runners/Runner"),
			inflate: (src, dst) => Object.assign(dst, src)
		}
	}, () => resolve(store));
});

store.exit = function exit() {
	return new Promise(resolve => store.save(() => {
		console.log("DB saved.");
		resolve();
	}));
};

module.exports = store;
