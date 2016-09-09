"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = module.exports = new Loki(config.fromUserData("store.json"), {
	autosave: true
});

Object.assign(store, {
	loaded: new Promise(resolve => {
		setImmediate(() => {
			const plugin = require("../plugins/plugin");
			const Runner = require("../runners/Runner");

			store.loadDatabase({
				plugins: {
					inflate: src => {
						const instance = plugin.instanciate(src);

						instance.assign(src);

						return instance;
					}
				},
				runners: {
					proto: Runner,
					inflate: (src, dst) => dst.assign(src)
				}
			}, resolve);
		});
	}).then(() => store),

	stop() {
		return new Promise(resolve => store.close(resolve));
	}
});
