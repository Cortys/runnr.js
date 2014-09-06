var path = require("path"),
	config = require("../../config.js"),
	Datastore = require("nedb"),
	Q = require("Q"),
	db;

Datastore.prototype.findDeferred = Q.nfbind(Datastore.prototype.find);
Datastore.prototype.findOneDeferred = Q.nfbind(Datastore.prototype.findOne);

db = {
	config: new Datastore({ filename:path.join(config.userData, "config.db") }),
	plugins: new Datastore({ filename:path.join(config.userData, "plugins.db") })
};

module.exports = db;
