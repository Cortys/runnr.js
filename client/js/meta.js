(function() {
	var app = angular.module("meta", []);

	app.controller("MetaController", function() {
		this.title = data.title;

		this.theme = {
			name: "Light",
			id: "light",
			load: [
				{
					file: "desktop",
					media: null
				}
			]
		}
	});
})();
