(function() {
	angular.module("core")
		.controller("MetaController", MetaController);

	MetaController.$inject = ["themes.theme"];

	function MetaController(theme) {
		var t = this;

		t.title = "";

		theme.getTheme().then(function(theme) {
			t.theme = theme;
		});
	}

})();
