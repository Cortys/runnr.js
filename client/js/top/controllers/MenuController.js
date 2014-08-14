(function() {
	angular.module("top")
		.controller("MenuController", MenuController);

	function MenuController() {

	}

	MenuController.prototype = {
		items: [
			{
				name: "runners",
				text: "Runners"
			}, {
				name: "plugins",
				text: "Plugins"
			}
		],
		activeItem: "runners",
		activateItem: function(item) {
			this.activeItem = item.name;
		}
	};

})();
