(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var o = Object.create(coreApi.route("plugins"), {

			client: { value: function(id) {
				return this.route(id).route("client");
			} }
		});

		o.connector = coreApi.root.route("js").route("connector").url;

		return o;
	}
})();
