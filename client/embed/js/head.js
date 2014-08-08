(function() {
	var app = angular.module("head", []);

	app.directive("head", function() {
		return {
			restrict: "E",
			templateUrl: "html/head.html"
		};
	});

	app.controller("HeadController", function() {

	});
})();
