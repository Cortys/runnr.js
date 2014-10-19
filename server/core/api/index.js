var Q = require("q"),
	Api = require("./Api");

// Base:

var apiBase = {
		plugins: require("../plugins"),
		theme: require("../themes")
	};

Api.prototype.expose(apiBase, null, apiBase);

module.exports = new Api("api", apiBase);
