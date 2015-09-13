"use strict";

const store = require("../store");

let collection = store.getCollection("plugins");

if(collection === null) {
	console.log("Added plugins collection.");
	collection = store.addCollection("plugins", {
		indices: ["name"]
	});

	collection.ensureUniqueIndex("name");
}

module.exports = collection;
