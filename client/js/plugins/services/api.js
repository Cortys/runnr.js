(function() {
	angular.module("plugins")
		.factory("plugins.api", api);

	api.$inject = ["core.api"];

	function api(coreApi) {

		var o = Object.create(coreApi.route("plugins"), {});

		o.connector = coreApi.root.route("js").route("connector").url;

		return o;
	}
})();
