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
			name: "Light",
			id: "light",
			css: [
				{
					file: "desktop",
					media: null
				}
			]
		};
		return {
			getTheme: function (callback) {
				callback(t);
			}
		};
	});
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
