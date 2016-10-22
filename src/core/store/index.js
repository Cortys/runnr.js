"use strict";

const config = require("../config");
const Loki = require("lokijs");

const store = module.exports = new Loki(config.fromUserData("store.json"));

Object.assign(store, {
	loaded: new Promise(resolve => {
		setImmediate(() => {
			const plugin = require("../plugins/plugin");
			const Runner = require("../runners/Runner");

			resolve(store.initializePersistence({
				autoload: true,
				autosave: true,
				inflate: {
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
				}
			}));
		});
	}).then(() => store),

	stop: () => store.close()
});
