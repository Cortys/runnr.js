(function() {
	var app = angular.module("themes", []);

	app.factory("theme", function() {
		var t = {
			name: "Light",
			id: "light",
			css: [
				{
					file: "desktop",
					media: null
				}
			]
		};
		return {
			getTheme: function (callback) {
				callback(t);
			}
		};
	});
})();
