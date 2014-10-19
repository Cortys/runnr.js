(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var o = {

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

		o.raw = function(id, url) {
			return "/api/plugins/"+id+this.apiRaw.plugin.client+"/"+url;
		};

		o.absoluteRaw = function(id, url) {
			return coreApi.absolute+this.raw(id, url);
		};

		o.connector = "/js/connectors/common.js";

		return o;
	}
})();
