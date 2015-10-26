"use strict";

const owe = require("owe-core");

module.exports = function expose(err) {
	return owe.resource(err, {
		expose: true
	});
};
