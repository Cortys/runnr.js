"use strict";

const owe = require("owe.js");
const store = require("../store");

module.exports = {
	exists(name) {
		return store.collection && typeof store.collection.by("name", name) === "object";
	},

	constraints: new Set([
		null,
		"string",
		"number",
		"integer",
		"boolean",
		"date",
		"time",
		"period",
		"file",
		"directory",
		"fs"
	]),

	validateConstraint(constraint) {
		if(!this.constraints.has(constraint))
			throw new owe.exposed.Error("Invalid constraint.");

		return constraint;
	}
};
