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
