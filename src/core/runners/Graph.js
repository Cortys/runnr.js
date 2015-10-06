"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

class Graph extends StoreItem {
	constructor(preset) {
		const exposed = [];

		super(exposed, exposed, preset);

		owe(this, owe.serve({
			router: {
				filter: new Set(exposed),
				writable: false
			},
			closer: {
				filter: true,
				writable: false
			}
		}));
	}
}

module.exports = Graph;
