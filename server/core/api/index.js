var ApiRoot = require("./ApiRoot"),
	api = new ApiRoot("api");

api.serve = require("./servers")(api);

module.exports = api;
