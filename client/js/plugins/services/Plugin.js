(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["core.api", "plugins.api", "themes.api", "$q"];

	function PluginFactory(api, pluginsApi, themesApi, $q) {

		function Plugin(id) {
			this.id = id;

			var client = pluginsApi.client(id),
				pluginPath = client.route("raw").url.getAbsolute();

			this.client = Object.create(client, {
				html: {
					get: function() {
						return $q.all([client.get("html"), themesApi.theme]).then(function(data) {
							var html = data[0],
								theme = data[1],
								result,
								meta = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src "+api.root.route("frameworks").url.absolute+" "+themesApi.url.absolute+" "+pluginPath+" "+api.root.route("js").route("connectors").url.absolute+"; frame-src 'none'; connect-src 'none'\" />",
								base = "<base href='"+pluginPath+"' target='_self' />",
								script = "<script src='"+pluginsApi.connector+"' type='text/javascript'></script>",
								link = "";
							theme.css.plugin.forEach(function(v, i) {
								link += '<link rel="stylesheet" type="text/css" href="'+themesApi.raw(v.file)+'" media="'+(v.media || '')+'" />';
							});
							result = html.replace(/(<head[^>]*>)/, "$1"+meta+base+script+link);
							return result;
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

		Plugin.isPlugin = function(plugin) {
			return plugin instanceof Plugin;
		};

		return Plugin;
	}
})();
