(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["plugins.api"];

	function PluginFactory(pluginsApi) {

		function Plugin(id) {
			this.id = id;

			this.client = pluginsApi.client(id);

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
