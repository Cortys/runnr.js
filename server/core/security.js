var db = require("./db").security,
	Q = require("q"),
	pem = require("pem"),
	config = require("../config"),

	cache = null,

security = {
	generate: function() {
		return Q.ninvoke(pem, "createCertificate", {
			days:365,
			selfSigned:true,
			organization: config.name,
			organizationUnit: config.name+" Security",
		}).then(function(key) {
			return Q.ninvoke(db, "remove", {}, { multi:true }).then(function() {
				return key;
			});
		}).then(function(key) {
			key.created = new Date();
			return Q.ninvoke(db, "insert", key);
		});
	},

	read: function() {
		var t = this;
		return Q.ninvoke(db, "find", {}).then(function(entries) {
			if(!entries.length)
				throw null;
			var r = entries[0],
				d = new Date();
			d.setTime(d.getTime() - 365 * 86400000);
			if(r.created < d)
				throw null;
			return r;
		}).then(undefined, function(err) {
			return t.generate();
		}).then(function(key) {
			if(cache === null)
				cache = key;
			return key;
		});
	},

	get: function() {
		return cache?Q(cache):this.read();
	}
};

module.exports = security;
