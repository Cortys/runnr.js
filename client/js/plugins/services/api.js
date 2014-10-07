(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var rawGen = function(id, url) {
			return "plugins/"+id+"/"+"client/"+url;
		}, o = {

			absoluteRaw: function(id, url) {
				return coreApi.absoluteRaw(rawGen(id, url));
			},

			raw: function(id, url, useSuper) {
				return useSuper?coreApi.raw(rawGen(id, url)):rawGen(id, url);
			},

			client: function(id) {
				var t = this;
				return {
					get html() {
						return coreApi.get(t.raw(id, "html")).then(function(html) {
							return {
								html: html.data,
								headers: html.headers()
							};
						});
					}
				};
			}
		};

		return o;
	}
})();
