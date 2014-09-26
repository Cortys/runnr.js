(function() {
	angular.module("top")
		.controller("top.MenuController", MenuController);

	MenuController.$inject = ["panes.history", "plugins.Plugin"];

	function MenuController(panesHistory, Plugin) {
		this.panesHistory = panesHistory;

		this.items = [
			{
				text: "Runners",
				name: "runners",
				plugin: new Plugin("runners")
			}, {
				text: "Plugins",
				name: "plugins",
				plugin: new Plugin("plugins")
			}
		];

		this.activateItem(this.items[1]);
	}

	MenuController.prototype = {
		activeItem: null,
		panesHistory: null,

		items: [],

		activateItem: function(item) {
			this.activeItem = item;
			this.panesHistory.replaceState(item);
		}
	};

})();
