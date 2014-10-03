(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["plugins.api"];

	function PluginFactory(pluginsApi) {

		function Plugin(id) {
			this.id = id;

			var client = pluginsApi.client(id);

			this.client = Object.create(client, {
				html: {
					get: function() {
						return client.html.then(function(html) {
							var result,
								base = "<base href='"+pluginsApi.absoluteRaw(id)+"' target='_top' />",
								link = "";
							result = html.replace(/(<head[^>]*>)/, "$1"+base+link);
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
