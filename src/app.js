"use strict";

const core = require("./core/index.js");

core.then(function(core) {
	console.log(JSON.stringify(core.plugins.list));
});
