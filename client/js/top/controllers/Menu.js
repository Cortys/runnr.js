(function() {
	angular.module("top")
		.controller("top.MenuController", MenuController);
	
	MenuController.$inject = ["panes.history"];
	
	function MenuController(panesHistory) {
		this.panesHistory = panesHistory;
		this.activateItem(this.items[0]);
	}

	MenuController.prototype = {
		activeItem: null,
		panesHistory: null,
		
		items: [
			{
				name: "runners",
				text: "Runners"
			}, {
				name: "plugins",
				text: "Plugins"
			}
		],
		
		activateItem: function(item) {
			this.activeItem = item;
			this.panesHistory.replaceState(item);
		}
	};

})();
