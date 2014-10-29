var config = require("../config");

function frameworks(api) {

	var o = {};

	api.offer(o).provider(
		api.serve.fs(config.root + "/bower_components")
	).publish("frameworks");
}

module.exports = frameworks;
