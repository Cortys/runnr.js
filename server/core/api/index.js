var Q = require("q"),
	Api = require("./Api"),
	api;

// Base:

var apiBase = {
	theme: require("../themes"),
	plugins: require("../plugins")
};

Api.prototype.expose(apiBase, apiBase, null); // apiBase exposes itself as a static router. No content is provided.

api = new Api("api", apiBase);

module.exports = api;
