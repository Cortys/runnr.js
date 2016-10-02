"use strict";

const uuid = require("uuid");

function custom(installRequest, validateManifest) {
	return Promise.resolve({
		type: "graph",
		source: "custom",
		name: `@custom/${uuid.v1()}`,
		displayName: installRequest.name,
		ports: {
			in: {},
			out: {}
		}
	}).then(validateManifest);
}

module.exports = custom;
