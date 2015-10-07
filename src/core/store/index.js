"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = module.exports = new Loki(config.fromUserData("store.db"), {
	autosave: true
});

store.loaded = new Promise(resolve => {
	setImmediate(() => store.loadDatabase({
		plugins: {
			proto: require("../plugins/Plugin"),
			inflate: (src, dst) => Object.assign(dst, src)
		},
		runners: {
			proto: require("../runners/Runner"),
			inflate: (src, dst) => Object.assign(dst, src)
		}
	}, resolve));
}).then(() => store);

store.exit = function exit() {
	return new Promise(resolve => store.close(resolve));
};
