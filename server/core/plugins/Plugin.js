var path = require("path"),
	fs = require("fs"),
	Q = require("q"),
	db = require("../db/db.js").plugins,
	sanitizer = require("html-css-sanitizer");

function Plugin(id) {
	
	this.id = id;
	
	this.db = Q.ninvoke(db, "findOne", { _id:this.id }).then(function(data) {
		if(data)
			return data;
		throw new Error("A plugin named '"+id+"' is not installed.");
	});
	
	this.client.parent = this;
}

Plugin.prototype = {
	
	id: null,
	db: null,
	installationLocation: null,
	
	get manifest() {
		
		var t = this;
		return this.db.then(function(db) {
			return db.manifest;
		});
	},
	
	client: {
		parent: null,
		
		get html() {
			
			var t = this;
			console.log(this);
			return t.parent.manifest.then(function(manifest) {
				return Q.ninvoke(fs, "readFile", path.join(t.parent.installationLocation, manifest._id, manifest.plugin.client));
			}).then(function(buffer) {
				return sanitizer.sanitize(buffer, function(a) {
					return a;
				}, function(a) {
					return a;
				});
			});
		}
	}
};

module.exports = Plugin;