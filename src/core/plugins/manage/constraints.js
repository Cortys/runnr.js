"use strict";

const owe = require("owe.js");

const constraints = new Set([
	null,
	"string",
	"number",
	"integer",
	"boolean",
	"date",
	"time",
	"datetime",
	"period",
	"file",
	"directory"
]);

module.exports = {
	validate(constraint) {
		if(!constraints.has(constraint))
			throw new owe.exposed.Error(`Invalid constraint '${constraint}'.`);

		return constraint;
	},

	match(data, constraint) {
		this.validate(constraint);

		return data;
	}
};
