(function(){
	var app = angular.module("panes", []);

	app.directive("panes", function() {
		return {
			restrict: "E",
			templateUrl: "html/panes.html"
		};
	})

	app.controller("PanesController", function() {

	});
})();
