var ApiRoot = require("./ApiRoot"),
	api = new ApiRoot("api");

api.serve = require("./servers")(api);
api.File = require("./File");

module.exports = api;
