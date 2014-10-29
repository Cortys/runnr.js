var db = require("./db").security,
	B = require("bluebird"),
	pem = require("pem"),
	config = require("../config"),

	cache = null,

security = {
	generate: function() {
		return pem.createCertificateAsync({
			days:365,
			selfSigned:true,
			organization: config.name,
			organizationUnit: config.name+" Security",
		}).then(function(key) {
			return db.removeAsync({}, { multi:true }).then(function() {
				return key;
			});
		}).then(function(key) {
			key.created = new Date();
			return db.insertAsync(key);
		});
	},

	read: function() {
		var t = this;
		return db.findAsync({}).then(function(entries) {
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
				cache = B.resolve(key);
			return key;
		});
	},

	get: function() {
		return cache || this.read();
	}
};

B.promisifyAll(pem);

module.exports = security;
