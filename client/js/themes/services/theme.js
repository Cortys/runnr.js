(function() {
	angular.module("themes")
		.factory("themes.theme", theme);

	theme.$inject = ["$http"];

	function theme($http) {
		var themePromise = $http.get("/theme/manifest", { responseType:"json" }).then(function(result) {
			return result.data;
		});
		
		return {
			getTheme: function () {
				return themePromise;
			}
		};
	}
	
})();
