"use strict";

const owe = require("owe.js");
const store = require("./store");

const Runner = require("./Runner");

let listView;

store.loaded.then(() => listView = store.collection.getDynamicView("list") || store.collection.addDynamicView("list", {
	persistent: false
}).applySimpleSort("name"));

const runners = {
	get list() {
		return listView.data();
	},

	getById(runnerId) {
		return store.collection.get(runnerId);
	},

	add(runner) {
		return Runner.add(runner);
	}
};

/* Api: */
const runnersApi = Object.assign(() => runners.list, {
	add: runners.add
});

owe(runnersApi, owe.chain([
	owe.serve({
		router: {
			filter: new Set(["add"])
		}
	}), {
		router: runners.getById
	}
]));

owe(runners, owe.reroute(runnersApi));

module.exports = runners;
