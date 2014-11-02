var path = require("path"),
	B = require("bluebird"),
	api = require("../api").api,
	fs = require("fs"),
	db = require("../db").plugins;

function Plugin(id) {

	var t = this;

	this.id = id;

	this.db = db.findOneAsync({ _id:this.id }).then(function(data) {
		if(data)
			return data;
		throw new Error("A plugin named '"+id+"' is not installed.");
	});

	this.installationLocation = this.db.then(function(db) {
		return db.installationLocation;
	});

	this.manifest = this.db.then(function(db) {
		return db.manifest;
	});

	this.client = Object.create(this.client, { parent: { value: this } });

	api.offer(this).router(
		api.serve.route("client", undefined, true).router(
			api.serve.route("raw", this.client).provider(
				api.serve.fs(this.client.raw)
			)
		).redirector(
			api.serve.static.exposed(this.client)
		).router(function(route) {
			console.log(route);
			return api.serve.api(new Plugin(route)).route("client").route("raw").exposed;
		})
	).provider(
		api.serve.static.content({
			manifest: this.manifest
		})
	);

	return this.db.then(function() {
		return t;
	});
}

Plugin.prototype = {

	id: null,
	db: null,

	installationLocation: null,
	manifest: null,

	client: {
		parent: null,

		get html() {

			var t = this;

			return t.parent.db.then(function(db) {

				return fs.readFileAsync(path.join(db.installationLocation, db.manifest.id, "client", db.manifest.plugin.client)).then(function(html) {
					return html;
				}, function() {
					throw new Error("No main page found.");
				});
			});
		},

		raw: function(file) {
			return this.parent.db.then(function(db) {
				return path.join(db.installationLocation, db.manifest.id, "client", file);
			});
		}

	}
};

Plugin.install = function install(manifest, installationLocation) {
	if(manifest.id != "all" && manifest.id != "connector") // Plugins named 'all' and 'connector' are not allowed because the plugin http API already uses these identifiers.
		db.insert({
			_id: manifest.id,
			manifest: manifest,
			installationLocation: installationLocation
		});

	return manifest.id;
};

module.exports = Plugin;
