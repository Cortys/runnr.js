"use strict";

const owe = require("owe.js");
const oweFs = require("owe-fs");

const addRunner = require("./manage/add");
const deleteRunner = require("./manage/delete");

const StoreItem = require("../StoreItem");
const item = StoreItem.dbItem;

class Runner extends StoreItem {
	constructor(runner) {
		if(!runner || typeof runner !== "object" || !("$loki" in runner))
			throw new owe.exposed.Error("Runner not found.");

		super(runner, function onNewRunner() {
			owe(this, owe.serve({
				router: {
					filter: new Set(["id", "name", "active", "activate", "deactivate", "delete"])
				},
				closer: {
					filter: true,
					writable: new Set(["active"])
				}
			}));
		});
	}

	get id() {
		return this[item].$loki;
	}

	get name() {
		return this[item].name;
	}

	get active() {
		return this[item].active;
	}

	set active(val) {
		this[val ? "activate" : "deactivate"]();
	}

	activate() {
		this[item].active = true;
		this.emit("activeChanged", true);

		return Promise.resolve();
	}

	deactivate() {
		this[item].active = false;
		this.emit("activeChanged", false);

		return Promise.resolve();
	}

	delete() {
		return deleteRunner(this)
			.then(() => super.delete())
			.then(() => this.emit("deleted"));
	}

	static add(runner) {
		return addRunner(runner).then(runner => new Runner(runner));
	}
}

module.exports = Runner;
