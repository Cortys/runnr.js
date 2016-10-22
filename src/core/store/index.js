"use strict";

const config = require("../config");
const Loki = require("lokijs");

const { stageManager } = require("../managers");

const loaded = require("../helpers/generateLock")();

const store = new Loki(config.fromUserData("store.json"));

Object.assign(store, {
	loaded: loaded.then(() => store),

	stop: () => store.close()
});

// Add loaded lock to stageManager to allow only basic Plugin & Runner assignments before the database is loaded.
// This is necessary because some non-basic assignments use the database.
stageManager({
	initializeDatabase: () => loaded
});

module.exports = store;

const plugin = require("../plugins/plugin");
const Runner = require("../runners/Runner");

store.initializePersistence({
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
}).then(loaded.unlock);
