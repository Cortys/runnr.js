(function() {
	var app = angular.module("runnr.js", ["head", "panes"]);

	app.factory("appData", function() {
		return {
			title:"Runnr.js"
		};
	});

	app.controller("DataController", ["appData", function(appData) {
		this.title = appData.title;
	}]);
})();
