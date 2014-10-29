var path = require("path"),
	B = require("bluebird"),
	config = require("../config"),
	Datastore = require("nedb"),
	db;

B.promisifyAll(Datastore.prototype);

db = {
	config: new Datastore({ filename:path.join(config.userData, "config.db"), autoload:true }),
	plugins: new Datastore({ filename:path.join(config.userData, "plugins.db"), autoload:true }),
	security: new Datastore({ filename:path.join(config.userData, "security.db"), autoload:true })
};

console.log("Established database connection.");

module.exports = db;
