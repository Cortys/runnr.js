(function() {
	angular.module("themes")
		.directive("showOnThemePreload", showOnThemePreload);

	showOnThemePreload.$inject = ["themes.api"];

	function showOnThemePreload(themesApi) {
		return {
			restrict: "A",
			scope: {},
			link: function(scope, element) {
				themesApi.rendered.then(function() {
					scope.$destroy();
				});

				scope.$on("$destroy", function(event) {
					element.remove();
				});
			}
		};
	}

})();
