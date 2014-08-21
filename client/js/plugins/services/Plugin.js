(function() {
	angular.module("plugins")
		.factory("plugins.Plugin", PluginFactory);

	PluginFactory.$inject = [];

	function PluginFactory() {

		function Plugin() {
			
		}

		Plugin.prototype = {
			
		};

		return Plugin;
	}
})();
