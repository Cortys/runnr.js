(function() {
	angular.module("themes")
		.directive("preloadThemeLinkingDelay", preloadLinkingDelay);

	preloadLinkingDelay.$inject = ["$q", "$timeout", "themes.theme"];

	function preloadLinkingDelay($q, $timeout, theme) {
		return {
			restrict: "A",
			scope: {
				preloadDelay: "@preloadThemeLinkingDelay"
			},
			compile: function() {
				var deferred = $q.defer(),
					delay = $q.defer();
				
				theme.addRenderingPromise($q.all([deferred.promise, delay.promise]));
				
				function link() {
					console.log(scope);
				}
				
				return {
					pre: function(scope) {
						$timeout(function() {
							delay.resolve();
						}, scope.preloadDelay*1);
					},
					post: function() {
						deferred.resolve();
					}
				};
			}
		};
	}

})();
