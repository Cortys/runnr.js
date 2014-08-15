(function() {
	angular.module("themes")
		.factory("theme", theme);

	theme.$inject = ["$http"];

	function theme($http) {
		var themeCached = null,
			waiting = [],
		
		f = function(data) {
			themeCached = data;
			waiting.forEach(function(c) {
				c(data || null);
			});
			waiting = [];
		};
		
		$http.get("/theme/manifest", { responseType:"json" }).success(f).error(f);
		
		return {
			getTheme: function (callback) {
				if(themeCached)
					return callback(themeCached);
				
				if(typeof callback === "function")
					waiting.push(callback);
			}
		};
	}
	
})();
