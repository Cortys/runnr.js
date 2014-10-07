(function() {
	angular.module("core")
		.factory("core.api", api);

	api.$inject = ["$http"];

	function api($http) {

		var o = {

			absoluteRaw: function(url) {
				return this.raw(url);
			},

			raw: function(url) {
				return "/api/"+url;
			},

			get: function(url, data) {
				if(data === undefined)
					data = {};
				data.api = true;
				return $http.post(this.raw(url), data);
			}
		};

		return o;
	}
})();
