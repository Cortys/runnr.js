(function() {
	angular.module("core")
		.factory("core.api", api);

	api.$inject = ["$http", "$location", "core.socket"];

	function api($http, $location, socket) {

		var o = {

				absolute: $location.protocol()+"://"+$location.host()+":"+location.port,

				get: function(url, data) {
					var t = this;
					if(data === undefined)
						data = {};
					data.api = true;
					return $http.post(url, data);
				}
		};
		return o;
	}
})();
