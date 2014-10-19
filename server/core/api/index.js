var Q = require("q"),
	Api = require("./Api"),
	api;

// Base:

var apiBase = {
	theme: require("../themes"),
	plugins: require("../plugins")
};

Api.prototype.expose(apiBase, null, apiBase);

api = new Api("api", apiBase);

module.exports = api;
