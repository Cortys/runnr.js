angular.module("runnr.js", ["meta", "top", "panes"]);

angular.module("meta", ["themes"]);

angular.module("panes", []);

angular.module("themes", []);

angular.module("top", []);

(function() {
	angular.module("meta")
		.controller("MetaController", MetaController);

	MetaController.$inject = ["theme"];

	function MetaController(theme) {
		var t = this;

		t.title = "";

		theme.getTheme(function(theme) {
			t.theme = theme;
		});
	}

})();

(function(){
	angular.module("panes")
		.controller("PanesController", PanesController);

	function PanesController() {

	}

})();

(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "theme"];

	function themeInclude($compile, theme) {
		return {
			restrict: "E",
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude)
					theme.getTheme(function(theme) {
						element.attr("ng-include", "'theme/" + (scope.$eval(attrs.src) || theme.html+".html") +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
			}
		};
	}

})();

(function() {
	angular.module("themes")
		.factory("theme", theme);

	theme.$inject = ["$timeout"];

	function theme($timeout) {
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
	}
	
})();

(function() {
	angular.module("top")
		.controller("TopController", TopController);

	function TopController() {

	}

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

})();
