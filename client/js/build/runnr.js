// EXPOSE BASIC STATIC APP DATA TO EVERYONE

var data = {
	title: "Runnr.js"
};

(function() {
	var app = angular.module("meta", []);

	app.controller("MetaController", function() {
		this.title = data.title;

		this.theme = {
			name: "Light",
			id: "light",
			load: [
				{
					file: "desktop",
					media: null
				}
			]
		}
	});
})();

(function(){
	var app = angular.module("panes", []),

	PanesController = function() {

	};

	app.controller("PanesController", PanesController);

	app.directive("panes", function() {
		return {
			restrict: "E",
			templateUrl: "html/panes.html"
		};
	});
})();

(function() {
	var app = angular.module("runnr.js", ["meta", "top", "panes"]);
})();

(function() {
	var app = angular.module("themes", []);
	
})();

(function() {
	var app = angular.module("top", []),

	TopController = function() {
		this.title = data.title;
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
			templateUrl: "html/top.html"
		};
	});

})();
