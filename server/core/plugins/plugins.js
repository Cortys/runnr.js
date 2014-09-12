var db = require("../db/db.js").plugins,
	config = require("../../config.js"),
	fs = require("fs"),
	path = require("path"),
	Q = require("q"),
	Plugin = require("./Plugin.js"),
	
plugins = {
	getRaw: function(filter, limit) {
		return Q.npost(db, "find", arguments);
	},
	countAll: function() {
		return Q.ninvoke(db, "count", {});
	},
	get: function(id) {
		return new Plugin(id);
	}
};

function scan(dir) {
	Q.ninvoke(fs, "readdir", dir).then(function(files) {
		files.forEach(function(e, i) {
			Q.ninvoke(fs, "readFile", path.join(dir, e, "manifest.json")).then(function(data) {
				var manifest = JSON.parse(data);
				Plugin.install(manifest, dir);
			});
		});
	});
}

function init() {
	
	plugins.countAll().then(function(count) {
		if(count)
			return;
		
		// Create indexes if not already done:
		db.ensureIndex({ fieldName:"manifest.core" });
		
		scan(path.join(config.root, "corePlugins"));
		scan(path.join(config.root, "plugins"));
	});
}

init();

module.exports = plugins;