"use strict";

const store = require("../store");

module.exports = {
	exists(name) {
		return typeof store.by("name", name) === "object";
	}
};
