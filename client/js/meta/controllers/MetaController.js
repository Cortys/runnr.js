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
