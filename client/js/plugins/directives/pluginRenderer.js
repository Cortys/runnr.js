(function() {
	angular.module("plugins")
		.directive("pluginRenderer", pluginRenderer);

	pluginRenderer.$inject = ["$http", "$compile"];

	function pluginRenderer($http, $compile) {

		function linker(scope, element, attrs) {
			scope.plugin().client.html.then(function(page) {

				var frame = document.createElement("iframe");

				frame.srcdoc = page.html.replace(/(<head[^>]*>)/i, "$1"+page.insert);
				frame.sandbox = "allow-scripts";

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
