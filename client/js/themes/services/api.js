(function() {
	angular.module("themes")
		.factory("themes.api", api);

	api.$inject = ["$http", "$q", "core.api"];

	function api($http, $q, coreApi) {
		var o = Object.create(coreApi.route("theme"), {
			theme: {
				get: function() {
					return themePromise;
				}
			},
			rendered: {
				get: function() {
					return renderDeferred.promise;
				}
			},

			raw: {
				value: function(content) {
					return raw.url.get(content);
				}
			},

			addRenderingPromise: {
				value: function(promise) {
					renderPromises++;
					promise.then(function() {
						if(--renderPromises <= 0)
							renderDeferred.resolve();
					}, function() {
						renderDeferred.reject();
					});
				}
			}
		}),
		
		raw = o.route("raw"),

		themePromise = o.get("manifest"),
		renderDeferred = $q.defer(),
		renderPromises = 0;

		o.addRenderingPromise(themePromise);

		return o;
	}

})();
