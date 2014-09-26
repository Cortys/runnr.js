(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var api = {
			client: function(id) {
				return {
					get html() {
						return coreApi.get("plugins/"+id+"/"+"client/html");
					}
				};
			}
		};

		return api;
	}
})();
