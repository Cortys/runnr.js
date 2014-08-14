(function() {
	angular.module("themes")
		.factory("theme", theme);

	theme.$inject = ["$http"];

	function theme($http) {
		return {
			getTheme: function (callback) {
				$http.get("/theme/manifest", { responseType:"json" }).success(callback);
			}
		};
	}
	
})();
