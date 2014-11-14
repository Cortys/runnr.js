var path = require("path"),
	B = require("bluebird"),
	baseApi = require("../api")
	api = baseApi.api,
	fs = require("fs"),
	db = require("../db").plugins;

function Plugin(id, persistent) {

	var t = this, r;

	this.id = id;

	if((r = (persistent && Plugin.store(this) || Plugin.store.lookup(this))))
		return r.selfPromise;

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

	this.resources = this.manifest.then(function(manifest) {
		var res = {};

		manifest.permissions.resources.forEach(function(v) {
			res[v] = true;
		});

		return res;
	});

	this.client = Object.create(this.client, { parent: { value: this } });

	api.offer(this).router(
		// CLIENT DATA:
		api.serve.route("client", undefined, true).router(
			api.serve.route("raw", this.client).provider(
				api.serve.fs(this.client.raw)
			),
			api.serve.route("resource", this).router(function(route) {
				return this.resources.then(function(resources) {
					if(!(route in resources)) {
						if(route == id)
							throw new Error("Plugin '"+id+"' cannot access itself as a resource.");
						throw new Error("Plugin '"+id+"' has no access to plugin '"+route+"'.");
					}
					return api.serve.api(new Plugin(route)).route("client").route("raw").exposed;
				});
			})
		).redirector(
			api.serve.static.exposed(this.client)
		)
	).provider(
		// GENERAL DATA:
		api.serve.static.content({
			id: this.id,
			manifest: this.manifest
		})
	);

	return (this.selfPromise = this.db.then(function() {
		return t;
	}));
}

Plugin.prototype = {

	id: null,
	db: null,

	installationLocation: null,
	manifest: null,

	client: {
		parent: null,
		
		connector: baseApi.route("js").route("connector").get("plugin.js"),

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

	},

	close: function() {
		Plugin.store.remove(this);
	}
};

Plugin.store = require("./PluginStore")(Plugin);

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
