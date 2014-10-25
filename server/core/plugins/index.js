var db = require("../db").plugins,
	config = require("../../config"),
	api = require("../api"),
	fs = require("fs"),
	path = require("path"),
	Q = require("q"),
	Plugin = require("./Plugin"),

plugins = {
	getRaw: function(filter, limit) {
		return Q.npost(db, "find", arguments);
	},
	countAll: function() {
		return Q.ninvoke(db, "count", {});
	},
	get: function(id) {
		var p = new Plugin(id);
		return p.db.then(function() {
			return p;
		});
	}
};

api.offer(plugins)
	.router(plugins.get)
	.provider(api.serve.static.content({
		get all() {
			return plugins.getRaw({ "manifest.core":true }, { "manifest.author":1 });
		}
	}))
	.publish("plugins");

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
		console.log("Plugin database ready.");
		if(count)
			return;

		// Create indexes if not already done:
		db.ensureIndex({ fieldName:"manifest.core" });

		scan(path.join(config.root, "corePlugins"));
		scan(path.join(config.root, "plugins"));

		console.log("Initialized new plugin db.");
	});
}

init();

module.exports = plugins;
