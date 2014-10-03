(function() {
	angular.module("themes")
		.directive("showOnThemePreload", showOnThemePreload);

	showOnThemePreload.$inject = ["themes.api"];

	function showOnThemePreload(themeApi) {
		return {
			restrict: "A",
			scope: {},
			link: function(scope, element) {
				themeApi.rendered.then(function() {
					scope.$destroy();
				});

				scope.$on("$destroy", function(event) {
					element.remove();
				});
			}
		};
	}

})();
