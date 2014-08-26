(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = ["$http"];

	function PluginFactory() {

		function Plugin(id) {
			this.id = id;
		}

		Plugin.prototype = {
			name: null,
			id: null,
			
			onInitialized: null
		};

		return Plugin;
	}
})();
