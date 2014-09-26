(function() {
	angular.module("core")
		.factory("core.api", api);

	api.$inject = ["$http"];

	function api($http) {

		var api = {
			get: function(url) {
				return $http.post("/api/"+url, { api:true });
			}
		};

		return api;
	}
})();
