(function() {
	angular.module("plugins")
		.directive("plugin", plugin);

	plugin.$inject = ["$http"];

	function plugin($http) {
		
		function linker(scope, element, attrs) {
			$http.get("/api/plugins/"+scope.id()+"/client/html").then(function(html) {
				element.append(html.data);
				element.attr("loaded", "");
			}, function() {
				element.attr("failed", "");
			});
		}
		
		return {
			restrict: "E",
			scope: {
				id: "&name"
			},
			link: linker
		};
	}

})();
