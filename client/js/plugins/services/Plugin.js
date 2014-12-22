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

				api = this.api = pluginsApi.route(id),
				client = api.route("client"),

				pluginPath = client.route("raw").url.getAbsolute(),
				resourcePath = client.route("resource").url.absolute+"/",
				connectorPath = client.url.getAbsolute("connector"),

				meta = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src "+frameworksPath+" "+themesPath+" "+pluginPath+" "+resourcePath+" "+connectorPath+"; child-src 'none'; base-uri "+pluginPath+"\" />",
				base = "<base href='"+pluginPath+"' target='_self' />",
				script = "<script src='"+connectorPath+"' type='text/javascript'></script>",
				fixed = base+script,

				manifest = this.manifest = api.get("manifest");

			this._cache = new Cache(cached?0:cacheLimit);

			this.client = Object.create(client, {
				html: {
					get: function() {
						return t._cache.lookup("html", function() {
							return $q.all([client.get("html"), themesApi.theme, manifest]).then(function(data) {
								var html = data[0],
								theme = data[1],
								manifest = data[2],

								link = "";

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
			name: null,
			id: null,

			_cache: null,

			emptyCache: function() {
				this._cache = {};
			},

			client: null
		};

		Plugin.isPlugin = function isPlugin(plugin) {
			return plugin instanceof Plugin;
		};

		return Plugin;
	}
}());
