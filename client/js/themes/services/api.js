(function() {
	angular.module("themes")
		.factory("themes.api", api);

	api.$inject = ["$http", "$q", "core.api"];

	function api($http, $q, coreApi) {
		var o = {

			raw: function(url) {
				return "/api/theme/"+url;
			},

			get theme() {
				return themePromise;
			},
			get rendered() {
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

		themePromise = coreApi.get(o.raw("?manifest"), { responseType:"json" }).then(function(result) {
			return result.data;
		}),
		renderDeferred = $q.defer(),
		renderPromises = 0;

		o.addRenderingPromise(themePromise);

		return o;
	}

})();
