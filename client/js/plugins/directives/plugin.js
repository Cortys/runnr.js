(function() {
	angular.module("plugins")
		.directive("plugin", plugin);

	plugin.$inject = ["$http", "$compile"];

	function plugin($http, $compile) {
		
		function linker(scope, element, attrs) {
			$http.get("/api/plugins/"+scope.id()+"/client/html").then(function(html) {
				
				/*var pluginScope = scope.$new(true);
				
				pluginScope.i = 3;*/
				
				var frame = document.createElement("iframe");
				
				frame.srcdoc = html.data;
				frame.sandbox = "";
				frame.setAttribute("seamless", "");
				
				element.append(frame);
				
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
			terminal: true,
			link: linker
		};
	}

})();
