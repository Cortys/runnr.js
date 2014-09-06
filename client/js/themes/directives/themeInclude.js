(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "$q", "themes.theme"];

	function themeInclude($compile, $q, theme) {
		return {
			restrict: "E",
			scope: {},
			priority: 3000,
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude) {
					
					var deferred = $q.defer();
					theme.addRenderingPromise(deferred.promise);
					
					theme.getTheme().then(function(theme) {
						element.attr("ng-include", "'api/theme/" + (scope.$eval(attrs.src) || theme.html+".html") +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});
					
					scope.$on("$includeContentLoaded", deferred.resolve);
					scope.$on("$includeContentError", deferred.reject);
				}
			}
		};
	}
	
})();
