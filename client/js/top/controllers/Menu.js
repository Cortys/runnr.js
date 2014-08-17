(function() {
	angular.module("top")
		.controller("top.MenuController", MenuController);
	
	MenuController.$inject = ["messages"];
	
	function MenuController(messages) {
		this.messageMan = messages.register("top.MenuController");
		
		this.activateItem(this.items[1]);
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
			
			this.messageMan.send("panes.PanesController", "goto", item.name);
		}
	};

})();
