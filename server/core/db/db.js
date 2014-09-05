var path = require("path"),
	config = require("../../config.js"),
	Datastore = require("nedb"),
	Q = require("Q"),
	db;

function deferize(name) {
	return function() {
		var f = this[name];
		if(typeof f !== "function")
			return;
		var deferred = Q.defer();
		console.log(arguments);
		f.apply(this, [].concat(arguments, [function(err, data) {
			console.log(arguments);
			if(err)
				deferred.reject(err);
			else
				deferred.resolve(data);
		}]));
		return deferred.promise;
	};
}

Datastore.prototype.findDeferred = deferize("find");
Datastore.prototype.findOneDeferred = deferize("findOne");

db = {
	config: new Datastore({ filename:path.join(config.userData, "config.db") }),
	plugins: new Datastore({ filename:path.join(config.userData, "plugins.db") })
};

module.exports = db;
