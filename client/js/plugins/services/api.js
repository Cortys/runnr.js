(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var o = {

			api: coreApi.api.then(function(api) {
				return api.plugins;
			}),

			apiRaw: null,

			connector: null,

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

		coreApi.api.then(function(api) {
			o.apiRaw = api.plugins;

			o.raw = function(id, url) {
				return this.apiRaw.base+"/"+id+this.apiRaw.plugin.client+"/"+url;
			};

			o.absoluteRaw = function(id, url) {
				return coreApi.absolute+this.raw(id, url);
			};

			o.connector = api.js.base+api.js.connectors.base+api.js.connectors.plugin;

		});

		return o;
	}
})();
