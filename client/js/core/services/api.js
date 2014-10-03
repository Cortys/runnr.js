(function() {
	angular.module("core")
		.factory("core.api", api);

	api.$inject = ["$http", "$location"];

	function api($http, $location) {

		var o = {

			absoluteRaw: function(url) {
				return $location.protocol()+"://"+$location.host()+":"+$location.port()+this.raw(url);
			},

			raw: function(url) {
				return "/api/"+url;
			},

			get: function(url, data) {
				if(data == null)
					data = {};
				data.api = true;
				return $http.post(this.raw(url), data);
			}
		};

		return o;
	}
})();
