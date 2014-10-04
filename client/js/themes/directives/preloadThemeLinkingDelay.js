(function() {
	angular.module("themes")
		.directive("preloadThemeLinkingDelay", preloadLinkingDelay);

	preloadLinkingDelay.$inject = ["$q", "$timeout", "themes.api"];

	function preloadLinkingDelay($q, $timeout, themesApi) {
		return {
			restrict: "A",
			compile: function() {
				var deferred = $q.defer(),
					delay = $q.defer();

				themesApi.addRenderingPromise($q.all([deferred.promise, delay.promise]));

				return {
					pre: function(scope, element, attr) {
						$timeout(function() {
							delay.resolve();
						}, attr.preloadThemeLinkingDelay*1);
					},
					post: function() {
						deferred.resolve();
					}
				};
			}
		};
	}

})();
