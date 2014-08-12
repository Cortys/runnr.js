(function() {
	var app = angular.module("themes", []);

	app.factory("theme", function() {
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
	});

	app.directive("themeHtml", ["theme", function(theme) {
		var o = {
			restrict: "E",
			require: "^ngInclude",
			link: function(scope, element, attrs) {
				o.templateUrl = "themes/" + theme.id + "/"+ (attrs.href || theme.html) + ".html";
			}
		};
		theme.getTheme(function(theme) {

		});
		return o;
	}]);
})();
