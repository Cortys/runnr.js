(function() {
	angular.module("plugins")
		.directive("pluginRenderer", pluginRenderer);

	pluginRenderer.$inject = ["$http", "$compile"];

	function pluginRenderer($http, $compile) {

		function linker(scope, element, attrs) {
			scope.plugin().client.html.then(function(html) {

				var span = document.createElement("span"),
					frame = document.createElement("iframe");

				frame.srcdoc = html;
				frame.sandbox = "allow-scripts";

				span.appendChild(frame);
				element.append(span);

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
