(function() {
	angular.module("plugins")
		.directive("plugin", plugin);

	plugin.$inject = [];

	function plugin() {
		
		PluginCtrl.$inject = ["$scope"];
		
		function PluginCtrl($scope) {
			console.log($scope.id());
		}
		
		return {
			restrict: "E",
			scope: {
				id: "&name"
			},
			controller: PluginCtrl
		};
	}

})();
