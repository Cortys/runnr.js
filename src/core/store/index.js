"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = module.exports = new Loki(config.fromUserData("store.json"), {
	autosave: true
});

store.loaded = new Promise(resolve => {
	setImmediate(() => {
		const Plugin = require("../plugins/Plugin");
		const Runner = require("../runners/Runner");

		store.loadDatabase({
			plugins: {
				proto: Plugin,
				inflate: (src, dst) => {
					Object.assign(dst, src);
					dst.on("persist", () => Plugin.store.collection.update(dst));
				}
			},
			runners: {
				proto: Runner,
				inflate: (src, dst) => {
					Object.assign(dst, src);
					dst.on("persist", () => Runner.store.collection.update(dst));
				}
			}
		}, resolve);
	});
}).then(() => store);

store.exit = function exit() {
	return new Promise(resolve => store.close(resolve));
};
