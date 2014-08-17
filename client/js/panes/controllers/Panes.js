(function(){
	angular.module("panes")
		.controller("panes.PanesController", PanesController);
	
	PanesController.$inject = ["$scope", "messages"];
	
	function PanesController($scope, messages) {
		this.messageMan = messages.register("panes.PanesController").on("goto", function(event, page) {
			console.log(event, page);
		});
	}
	
	PanesController.prototype = {
		
	};
	
})();
