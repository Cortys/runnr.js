"use strict";

const Node = require("./Node");

class DataNode extends Node {
	constructor(preset, parentGraph) {
		super(preset, parentGraph);

		Promise.all([this.api.route("data"), this.graph.connected]).then(result => {
			const data = result[0];

			this.ports.out.data.writable.write(data);
		});
	}
}

module.exports = DataNode;
