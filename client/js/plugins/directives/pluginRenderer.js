(function() {
	angular.module("plugins")
		.directive("pluginRenderer", pluginRenderer);

	pluginRenderer.$inject = ["$http", "$compile", "plugins.Connector"];

	function pluginRenderer($http, $compile, Connector) {

		function linker(scope, element, attrs) {

			var plugin = scope.plugin(),
				connector;

			plugin.client.html.then(function(html) {

				var span = document.createElement("span"),
					frame = document.createElement("iframe");

				frame.srcdoc = html;
				frame.sandbox = "allow-scripts";

				span.appendChild(frame);
				element.append(span);

				connector = new Connector(plugin.receive, frame.contentWindow);

				element.attr("loaded", "");

			}, function() {
				element.attr("failed", "");
			});

			scope.$on("$destroy", function() {
				if(connector)
					connector.destroy();
				connector = null;
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
