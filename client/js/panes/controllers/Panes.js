(function(){
	angular.module("panes")
		.controller("panes.PanesController", PanesController);
	
	PanesController.$inject = ["$scope", "panes.history"];
	
	function PanesController($scope, history) {
		this.history = history;
	}
	
	PanesController.prototype = {
		history: null
	};
	
}());
