(function() {
	var app = angular.module("themes", []);

	app.factory("theme", ["$timeout", function($timeout) {
		var t = {
			"manifest_version": 1,
			"id": "light",
			"type": "theme",
			"extends": null,

			"name": "Light",
			"version": "0.1.0",
			"description": "A simple and friendly UI theme.",
			"author": "Clemens Damke",

			"css": [
				{
					"file": "desktop",
					"media": null
				}
			],

			"html": "struct"
		};
		return {
			getTheme: function (callback) {
				callback(t);
			}
		};
	}]);

	app.directive("themeInclude", ["$compile", "theme", function($compile, theme) {
		return {
			restrict: "E",
			link: function(scope, element, attrs) {
				if(attrs.src)
					theme.getTheme(function(theme) {
						element.attr("ng-include", "'themes/" + theme.id + "/" + attrs.src+"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
			}
		};
	}]);
})();
