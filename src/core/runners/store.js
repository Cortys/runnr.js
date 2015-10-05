"use strict";

const store = require("../store");

let collection = store.getCollection("runners");

if(collection === null) {
	console.log("Added runners collection.");
	collection = store.addCollection("runners", {
		indices: ["name", "active"],
		autoupdate: true
	});

	collection.ensureUniqueIndex("name");
}

module.exports = collection;
