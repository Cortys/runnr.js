"use strict";

const owe = require("owe.js");
const store = require("./store");

const Runner = require("./Runner");

const listView = store.getDynamicView("list") || store.addDynamicView("list", {
	persistent: false
}).applySimpleSort("name");

const runners = {
	get list() {
		return listView.mapReduce(runner => new Runner(runner), res => res);
	},

	get(runnerName) {
		return new Runner(store.by("name", runnerName));
	},

	add(runner) {

	}
};

/* Api: */
const runnersApi = function() {
	return runners.list;
};

runnersApi.add = runners.add;

owe(runnersApi, owe.chain([
	owe.serve({
		router: {
			filter: new Set(["add"])
		}
	}),
	owe.reroute(owe(null, runners.get, () => {
		throw undefined;
	}))
], {
	errors: "last",
	removeNonErrors: true
}));

owe(runners, owe.reroute(runnersApi));

module.exports = runners;
