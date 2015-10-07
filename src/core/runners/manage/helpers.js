"use strict";

const owe = require("owe.js");
const store = require("../store");

module.exports = {

	exists(name) {
		return store.collection && typeof store.collection.by("name", name) === "object";
	},

	validateName(name, ignore) {
		if(typeof name !== "string")
			throw new owe.exposed.TypeError("Runner name has to be a string.");

		name = name.trim();

		if(name === "")
			throw new owe.exposed.TypeError("Runner name must not conist of whitespace.");

		if(ignore != null && name === ignore)
			return name;

		if(this.exists(name))
			throw new owe.exposed.Error(`Runner with name '${name}' already exists.`);

		return name;
	}
};
