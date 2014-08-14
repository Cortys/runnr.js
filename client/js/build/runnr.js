/* File: client/js/runnr.js */
angular.module("runnr.js", ["meta", "top", "panes", "themes"]);

/* File: client/js/meta/module.js */
angular.module("meta", []);

/* File: client/js/panes/module.js */
angular.module("panes", []);

/* File: client/js/themes/module.js */
angular.module("themes", []);

/* File: client/js/top/module.js */
angular.module("top", []);

/* File: client/js/meta/controllers/MetaController.js */
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

/* File: client/js/panes/controllers/PanesController.js */
(function(){
	angular.module("panes")
		.controller("PanesController", PanesController);

	function PanesController() {

	}

})();

/* File: client/js/themes/directives/themeInclude.js */
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

/* File: client/js/themes/directives/themeLink.js */
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

/* File: client/js/themes/supply/theme.js */
(function() {
	angular.module("themes")
		.factory("theme", theme);

	theme.$inject = ["$http"];

	function theme($http) {
		return {
			getTheme: function (callback) {
				$http.get("/theme/manifest", { responseType:"json" }).success(callback);
			}
		};
	}
	
})();

/* File: client/js/top/controllers/MenuActionController.js */
(function() {
	angular.module("top")
		.controller("MenuActionController", MenuActionController);

	function MenuActionController() {

	}

	MenuActionController.prototype = {
		actions: [
			{
				name: "messages",
				clicked: function() {

				}
			}, {
				name: "settings",
				clicked: function() {

				}
			}/*, {
				name: "off",
				clicked: function() {

				}
			}*/ // TODO: implement password protected login and logout (later usecase for the off button)
		]
	};

})();

/* File: client/js/top/controllers/MenuController.js */
(function() {
	angular.module("top")
		.controller("MenuController", MenuController);

	function MenuController() {

	}

	MenuController.prototype = {
		items: [
			{
				name: "runners"
			}, {
				name: "plugins"
			}
		]
	};

})();
