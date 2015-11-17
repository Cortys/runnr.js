"use strict";

const generating = require("../generatingMaps");

// Store all event emitting objects with listeners for each API:
const apis = new generating.WeakMap(
	// Store all events for each event emitting object:
	api => new generating.Map(
		// Store a set of listeners for each event of an event emitting object:
		object => new generating.Map(
			// Every listener is stored as an object of the form { listener: [fn], once: [bool] }.
			event => new Set()
		)
	)
);

const listeners = {
	add(entry) {
		apis.get(entry.api).get(entry.object).get(entry.event).add({
			listener: entry.listener,
			once: entry.once
		});
	},

	remove() {

	},

	call() {

	},

	removeThenCall() {

	}
};

module.exports = listeners;
