var db = require("../db/db.js").plugins,
	config = require("../../config.js"),
	fs = require("fs"),
	path = require("path"),
	Q = require("q"),
	
plugins = {
	getAll: function(limit) {
		return Q.ninvoke(db, "find", {});
	},
	countAll: function() {
		
	},
	get: function(id) {
		return Q.ninvoke(db, "findOne", { _id:id }).then(function(data) {
			if(data)
				return data;
			throw new Error("A plugin named '"+id+"' is not installed.");
		});
	}
};

function scan(dir) {
	Q.ninvoke(fs, "readdir", dir).then(function(files) {
		files.forEach(function(e, i) {
			Q.ninvoke(fs, "readFile", path.join(dir, e, "manifest.json")).then(function(data) {
				var plugin = JSON.parse(data);
				plugin._id = plugin.id;
				plugin.id = undefined;
				db.insert(plugin);
			});
		});
	});
}

function init() {
	db.loadDatabase();

	plugins.getAll().then(function(data) {
		if(data.length)
			return;
		scan(path.join(config.root, "corePlugins"));
		scan(path.join(config.root, "plugins"));
	});
}

init();

module.exports = plugins;