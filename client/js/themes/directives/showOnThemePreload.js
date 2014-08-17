(function() {
	angular.module("themes")
		.directive("showOnThemePreload", showOnThemePreload);

	showOnThemePreload.$inject = ["themes.theme"];

	function showOnThemePreload(theme) {
		return {
			restrict: "A",
			scope: {},
			link: function(scope, element) {
				theme.rendered().then(function() {
					scope.$destroy();
				});
				
				scope.$on("$destroy", function(event) {
					element.remove();
				});
			}
		};
	}

})();
