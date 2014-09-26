(function() {
	angular.module("plugins")
		.directive("pluginRenderer", pluginRenderer);

	pluginRenderer.$inject = ["$http", "$compile"];

	function pluginRenderer($http, $compile) {

		function linker(scope, element, attrs) {
			scope.plugin().client.html.then(function(html) {

				/*var pluginScope = scope.$new(true);

				pluginScope.i = 3;*/

				var frame = document.createElement("iframe");

				frame.srcdoc = html.data;
				frame.sandbox = "allow-scripts";
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
				plugin: "&plugin"
			},
			terminal: true,
			link: linker
		};
	}

})();
