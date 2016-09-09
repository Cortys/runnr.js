"use strict";

const { mixins } = require("mixwith");

const Plugin = require("./Plugin");

class GraphPlugin extends mixins(Plugin) {
	constructor() {
		super();

		this.type = "graph";
	}
}

module.exports = GraphPlugin;
