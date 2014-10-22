var ApiRoot = require("./ApiRoot"),
	servers = require("./servers"),
	api = new ApiRoot("api");

api.serve = servers;

module.exports = api;
