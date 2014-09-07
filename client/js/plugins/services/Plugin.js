(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["$http"];

	function PluginFactory($http) {

		function Plugin(id) {
			this.id = id;
			console.log(id);
		}

		Plugin.prototype = {
			name: null,
			id: null,
			
			onInitialized: null
		};
		
		Plugin.isPlugin = function(plugin) {
			return plugin instanceof Plugin;
		};
		
		return Plugin;
	}
})();
