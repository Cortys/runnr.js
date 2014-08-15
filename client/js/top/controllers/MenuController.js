(function() {
	angular.module("top")
		.controller("MenuController", MenuController);

	function MenuController() {
		this.activateItem(this.items[0]);
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
		activeItem: null,
		activateItem: function(item) {
			this.activeItem = item;
		}
	};

})();
