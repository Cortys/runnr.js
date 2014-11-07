(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["core.api", "plugins.api", "themes.api", "$q"];

	function PluginFactory(api, pluginsApi, themesApi, $q) {

		var frameworksPath = api.root.route("frameworks").url.getAbsolute(),
			connectorPath = pluginsApi.connector.getAbsolute(),
			themesPath = themesApi.route("raw").url.getAbsolute();

		function Plugin(id) {
			this.id = id;

			var api = this.api = pluginsApi.route(id),
				client = api.route("client"),
				pluginPath = client.route("raw").url.getAbsolute(),

				resourcePath = client.route("resource").url.absolute+"/",

				meta = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src "+frameworksPath+" "+themesPath+" "+pluginPath+" "+resourcePath+" "+connectorPath+"; child-src 'none'; base-uri "+pluginPath+"\" />",
				base = "<base href='"+pluginPath+"' target='_self' />",
				script = "<script src='"+pluginsApi.connector.get("plugin.js")+"' type='text/javascript'></script>",
				fixed = base+script;

			this.manifest = api.get("manifest");

			this.client = Object.create(client, {
				html: {
					get: function() {
						return $q.all([client.get("html"), themesApi.theme]).then(function(data) {
							var html = data[0],
								theme = data[1],

								link = "";

							theme.css.plugin.forEach(function(v, i) {
								link += '<link rel="stylesheet" type="text/css" href="'+themesApi.raw(v.file)+'" media="'+(v.media || '')+'" />';
							});

							// Put meta tag before all HTML to prevent disabling it through comments or similar attack vectors.
							// Links and helpers are inserted properly into the head, exploiting them would cause no security breach.
							return (meta+html).replace(/(<head[^>]*>)/i, "$1"+fixed+link);
						});
					}
				}
			});

			console.log(id);
		}

		Plugin.prototype = {
			name: null,
			id: null,

			onInitialized: null,

			client: null,
		};

		Plugin.isPlugin = function isPlugin(plugin) {
			return plugin instanceof Plugin;
		};

		return Plugin;
	}
})();
