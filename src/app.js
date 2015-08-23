"use strict";

const core = require("./core/index.js");

const owe = require("owe.js");

core.then(function(core) {
	const coreApi = owe.api(core);

	coreApi.route("plugins").route("list").then(console.log);
}).catch(function(err) {
	console.error(err);
});
