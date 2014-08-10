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
