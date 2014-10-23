(function() {
	angular.module("themes")
		.factory("themes.api", api);

	api.$inject = ["$http", "$q", "core.api"];

	function api($http, $q, coreApi) {
		var renderDeferred = $q.defer(),

			o = Object.create(coreApi.route("theme"), {

				rendered: {	value: renderDeferred.promise },

				raw: { value: function(content) {
					return raw.url.get(content);
				} },

				addRenderingPromise: { value: function(promise) {
					renderPromises++;
					promise.then(function() {
						if(--renderPromises <= 0)
							renderDeferred.resolve();
					}, function() {
						renderDeferred.reject();
					});
				} }
			}),

			themePromise = o.theme = o.get("manifest"),

			raw = o.route("raw"),

			renderPromises = 0;

		o.addRenderingPromise(themePromise);

		return o;
	}

})();
