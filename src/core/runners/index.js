"use strict";

const owe = require("owe.js");
const store = require("./store");

const Runner = require("./Runner");

const listView = store.getDynamicView("list") || store.addDynamicView("list", {
	persistent: false
}).applySimpleSort("name");

const runners = {
	get list() {
		return listView.mapReduce(runner => runner, res => res);
	},

	get(runnerName) {
		return store.by("name", runnerName);
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
