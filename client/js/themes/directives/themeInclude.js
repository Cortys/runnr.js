(function() {
	angular.module("themes")
		.directive("themeInclude", themeInclude);

	themeInclude.$inject = ["$compile", "$q", "themes.api"];

	function themeInclude($compile, $q, themeApi) {
		return {
			restrict: "E",
			scope: {},
			priority: 3000,
			link: function(scope, element, attrs) {
				if(!attrs.ngInclude) {

					var deferred = $q.defer();
					themeApi.addRenderingPromise(deferred.promise);

					themeApi.theme.then(function(theme) {
						element.attr("ng-include", "'"+ themeApi.raw(scope.$eval(attrs.src) || theme.html, true) +"'");
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
