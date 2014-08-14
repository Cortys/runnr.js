(function() {
	angular.module("top")
		.controller("MenuController", MenuController);

	function MenuController() {

	}

	MenuController.prototype = {
		items: [
			{
				name: "runners"
			}, {
				name: "plugins"
			}
		]
	};

})();
