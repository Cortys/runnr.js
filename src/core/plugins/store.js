"use strict";

const db = require("../db");

let store = db.getCollection("plugins");

if(store === null) {
	store = db.addCollection("plugins", {
		indices: ["name"]
	});

	store.ensureUniqueIndex("name");
}

store.insert({
	name: "foo"
});

store.insert({
	name: "bar"
});

store.insert({
	name: "baz"
});

store.insert({
	name: "bar"
});

module.exports = store;
