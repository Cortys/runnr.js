(function() {
	var app = angular.module("meta", ["themes"]);

	app.controller("MetaController", ["theme", function(theme) {
		var t = this;

		t.title = "";

		theme.getTheme(function(theme) {
			t.theme = theme;
		});
	}]);
})();

(function(){
	var app = angular.module("panes", []),

	PanesController = function() {

	};

	app.controller("PanesController", PanesController);

	app.directive("panes", function() {
		return {
			restrict: "E",
			templateUrl: "html/panes.html",
			controller: "PanesController",
			controllerAs: "panes"
		};
	});
})();

(function() {
	var app = angular.module("runnr.js", ["meta", "top", "panes"]);
})();

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

(function() {
	var app = angular.module("top", []),

	TopController = function() {
		
	};

	TopController.prototype = {
		actions: [
			{
				name: "messages",
				clicked: function() {

				}
			}, {
				name: "settings",
				clicked: function() {

				}
			}, {
				name: "off",
				clicked: function() {

				}
			}
		]
	};

	app.controller("TopController", TopController);

	app.directive("top", function() {
		return {
			restrict: "E",
			templateUrl: "html/top.html",
			controller: "TopController",
			controllerAs: "top"
		};
	});

})();
