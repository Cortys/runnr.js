var db = require("../db/db.js").plugins,
	config = require("../../config.js"),
	fs = require("fs"),
	path = require("path"),
	Q = require("q"),
	
plugins = {
	getAll: function(limit) {
		return db.findDeferred({});
	},
	countAll: function() {
		
	},
	get: function(id) {
		return db.findDeferred({ _id:id }).then(function(data) {
			if(data[0])
				return data[0];
			return new Error("A plugin named '"+id+"' is not installed.");
		});
	}
};

function scan(dir) {
	fs.readdir(dir, function(err, files) {
		if(err)
			return;
		files.forEach(function(e, i) {
			fs.readFile(path.join(dir, e, "manifest.json"), function(err, data) {
				if(err)
					return;
				var plugin = JSON.parse(data);
				plugin._id = plugin.id;
				plugin.id = undefined;
				db.insert(plugin);
			});
		});
	});
}

db.loadDatabase();

plugins.getAll().then(function(data) {
	if(data.length)
		return;
	scan(path.join(config.root, "corePlugins"));
	scan(path.join(config.root, "plugins"));
});

module.exports = plugins;