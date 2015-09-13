"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

const StoreItem = require("../StoreItem");
const dbRunner = StoreItem.dbItem;

class Runner extends StoreItem {
	constructor(runner) {
		if(!runner || typeof runner !== "object" || !("$loki" in runner))
			throw new owe.exposed.Error("Runner not found.");

		super(runner, function onNewRunner() {
			owe(this, owe.serve({
				router: {
					filter: new Set([])
				},
				closer: {
					filter: true
				}
			}));
		});
	}
}

module.exports = Runner;
