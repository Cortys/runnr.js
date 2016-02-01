"use strict";

const store = require("../store");

module.exports.loaded = store.loaded.then(() => {
	let collection = store.getCollection("plugins");

	if(collection === null) {
		console.log("Added plugins collection.");
		collection = store.addCollection("plugins", {
			indices: ["name", "displayName", "type"]
		});

		collection.ensureUniqueIndex("name");
	}

	module.exports.collection = collection;
});
