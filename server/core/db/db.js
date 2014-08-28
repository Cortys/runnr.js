var path = require("path"),
	settings = require("../settings.js"),
	Datastore = require("nedb"),
	Q = require("Q"),
	db;

Datastore.prototype.findDeferred = function(arguments) {
	var deferred = Q.defer();
	
	this.find.apply(this, [].concat(arguments, [function(err, data) {
		if(err)
			deferred.reject(err);
		else
			deferred.resolve(data);
	}]));
	return deferred.promise;
};

db = {
	settings: new Datastore({ filename:path.join(settings.userData, "settings.db"), autoload: true }),
	plugins: new Datastore({ filename:path.join(settings.userData, "plugins.db"), autoload: true })
};

module.exports = db;
