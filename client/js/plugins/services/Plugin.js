(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["plugins.api", "themes.api", "$q"];

	function PluginFactory(pluginsApi, themesApi, $q) {

		function Plugin(id) {
			this.id = id;

			var client = pluginsApi.client(id);

			this.client = Object.create(client, {
				html: {
					get: function() {
						return $q.all([client.html, themesApi.theme]).then(function(data) {
							var html = data[0],
								theme = data[1],
								result,
								meta = "<meta http-equiv=\"Content-Security-Policy\" content=\""+html.headers["content-security-policy"]+"\" />",
								base = "<base href='"+pluginsApi.absoluteRaw(id, "")+"' target='_self' />",
								link = "";
							theme.css.plugin.forEach(function(v, i) {
								link += '<link rel="stylesheet" type="text/css" href="'+themesApi.raw(v.file, true)+'" media="'+(v.media || '')+'" />';
							});
							result = html.html.replace(/(<head[^>]*>)/, "$1"+meta+base+link);
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
