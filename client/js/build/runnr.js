angular.module("runnr.js", ["meta", "top", "panes", "themes"]);

angular.module("meta", []);

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
		.directive("theme", theme);

	theme.$inject = ["$compile", "theme"];

	function theme($compile, theme) {
		return {
			restrict: "A",
			transclude: "element",
			link: function(scope, element, attrs) {
				if("theme" in attrs)
					theme.getTheme(function(theme) {
						var clone = angular.element(document.createElement("link")),
							i = 0;
						clone.attr("rel", "stylesheet");
						clone.attr("type", "text/css");
						theme.css.forEach(function(v, i) {
							console.log(arguments);
							clone.attr("href", "theme/"+v.file+".css");
							clone.attr("media", v.media || undefined);
							element.after(clone);
							clone = clone.clone();
						});
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
