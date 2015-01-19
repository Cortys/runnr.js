(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["core.api", "core.Cache", "plugins.api", "themes.api", "$q"];

	function PluginFactory(api, Cache, pluginsApi, themesApi, $q) {

		var frameworksPath = api.root.route("frameworks").url.getAbsolute(),
			themesPath = themesApi.route("raw").url.getAbsolute(),

			cacheLimit = 2;

		function Plugin(id, cached) {
			this.id = id;

			var t = this,

				// API objects:
				api = pluginsApi.route(id),
				clientRoute = api.route("client"),

				// URLs:
				pluginPath = clientRoute.route("raw").url.getAbsolute(),
				resourcePath = clientRoute.route("resource").url.absolute+"/",
				connectorPath = clientRoute.url.getAbsolute("connector"),

				// HTML snippets:
				meta = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src "+frameworksPath+" "+themesPath+" "+pluginPath+" "+resourcePath+" "+connectorPath+"; child-src 'none'; base-uri "+pluginPath+"\" />",
				base = "<base href='"+pluginPath+"' target='_self' />",
				script = "<script src='"+connectorPath+"' type='text/javascript'></script>",
				fixed = base+script;

			this._cache = new Cache(cached?0:cacheLimit);

			this.manifest = api.get("manifest");

			this.receive = this.receive.bind(this);

			this.client = Object.create(clientRoute, {
				html: {
					get: function() {
						// Only fetch plugin html and render if it wasn't cached before:
						return t._cache.lookup("html", function() {
							// Plugin html was not cached. Fetch and render:
							return $q.all([clientRoute.get("html"), themesApi.theme, t.manifest]).then(function(data) {
								var html = data[0],
									theme = data[1],
									manifest = data[2],

								link = "";

								// Only style plugin frame with theme if specified:
								if(manifest.plugin.theme)
									theme.css.plugin.forEach(function(v, i) {
										link += '<link rel="stylesheet" type="text/css" href="'+themesApi.raw(v.file)+'" media="'+(v.media || '')+'" />';
									});

								// Put meta tag before all HTML to prevent disabling it through comments or similar attack vectors.
								// Links and helpers are inserted properly into the head, exploiting them would cause no security breach.
								return (meta+html).replace(/(<head[^>]*>)/i, "$1"+fixed+link);
							});
						});
					}
				}
			});
		}

		Plugin.prototype = {
			name: null, // Plugin UI name
			id: null, // Plugin unique identifier
			client: null, // Stores object, that grants access to plugin's client resources
			manifest: null, // Promise for the manifest JSON

			_cache: null, // Hidden cache – e.g. storing rendered client data

			wipeCache: function() {
				this._cache.wipe();
			},

			receive: function(message, callback) {
				console.log(message);
			}
		};

		Plugin.isPlugin = function isPlugin(plugin) {
			return plugin instanceof Plugin;
		};

		return Plugin;
	}
}());
