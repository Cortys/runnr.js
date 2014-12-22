(function() {
	angular.module("plugins")
		.directive("pluginRenderer", pluginRenderer);

	pluginRenderer.$inject = ["$http", "$compile"];

	function pluginRenderer($http, $compile) {

		function linker(scope, element, attrs) {

			var plugin = scope.plugin(),
				target;

			plugin.client.html.then(function(html) {

				var span = document.createElement("span"),
					frame = document.createElement("iframe");

				frame.srcdoc = html;
				frame.sandbox = "allow-scripts";

				span.appendChild(frame);
				element.append(span);

				if(plugin.connector.setEventTarget(target = frame.contentWindow))
					element.attr("loaded", "");
				else {
					span.remove();
					element.attr("failed", "");
				}

			}, function() {
				element.attr("failed", "");
			});

			scope.$on("$destroy", function() {
				plugin.connector.removeEventTarget(target);
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

}());
