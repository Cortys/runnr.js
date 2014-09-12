(function() {
	angular.module("plugins")
		.directive("plugin", plugin);

	plugin.$inject = ["$http", "$compile"];

	function plugin($http, $compile) {
		
		function linker(scope, element, attrs) {
			$http.get("/api/plugins/"+scope.id()+"/client/html").then(function(html) {
				element.append($compile(html.data)({
					// plugin scope
				}));
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
