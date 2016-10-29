"use strict";

const uuid = require("uuid");

function custom(installRequest, validateManifest) {
	return Promise.resolve({
		type: "customGraph",
		source: "custom",
		name: `@custom/${uuid.v1()}`,
		displayName: installRequest.name,
		// Add empty ports object just to pass validatePlugin check:
		ports: {
			in: {},
			out: {}
		}
	}).then(validateManifest);
}

module.exports = custom;
