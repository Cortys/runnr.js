(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "theme"];

	function themeInclude($compile, theme) {
		return {
			restrict: "E",
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude)
					theme.getTheme(function(theme) {
						element.attr("ng-include", "'theme/" + (scope.$eval(attrs.src) || theme.html+".html") +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
			}
		};
	}

})();
