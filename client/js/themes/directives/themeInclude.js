(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "$q", "themes.api"];

	function themeInclude($compile, $q, themesApi) {
		return {
			restrict: "E",
			scope: {},
			priority: 3000,
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude) {

					var deferred = $q.defer();
					themesApi.addRenderingPromise(deferred.promise);

					themesApi.theme.then(function(theme) {
						element.attr("ng-include", "'"+ themesApi.raw(scope.$eval(attrs.src) || theme.html) +"'");
						element.removeAttr("src");
						$compile(element)(scope);
					});

					scope.$on("$includeContentLoaded", deferred.resolve);
					scope.$on("$includeContentError", deferred.reject);
				}
			}
		};
	}

}());
