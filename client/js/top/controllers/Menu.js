(function() {
	angular.module("top")
		.controller("top.MenuController", MenuController);
	
	MenuController.$inject = ["messages"];
	
	function MenuController(messages) {
		this.activateItem(this.items[0]);
		
		this.messageMan = messages.register(this);
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
