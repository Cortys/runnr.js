(function() {
	angular.module("core")
		.controller("MetaController", MetaController);

	MetaController.$inject = ["themes.api"];

	function MetaController(themeApi) {
		var t = this;

		t.title = "";

		themeApi.theme.then(function(theme) {
			t.theme = theme;
		});
	}

})();
