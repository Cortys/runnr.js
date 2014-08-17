(function() {
	angular.module("themes")
		.factory("themes.theme", theme);

	theme.$inject = ["$http", "$q"];

	function theme($http, $q) {
		var o = {
			getTheme: function () {
				return themePromise;
			},
			rendered: function() {
				return renderDeferred.promise;
			},
			addRenderingPromise: function(promise) {
				renderPromises++;
				promise.then(function() {
					if(--renderPromises <= 0)
						renderDeferred.resolve();
				}, function() {
					renderDeferred.reject();
				});
			}
		},
		
		themePromise = $http.get("/theme/manifest", { responseType:"json" }).then(function(result) {
			return result.data;
		}),
		renderDeferred = $q.defer(),
		renderPromises = 0;
		
		o.addRenderingPromise(themePromise);
		
		return o;
	}
	
})();
