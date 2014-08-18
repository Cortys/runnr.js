(function() {
	angular.module("panes")
		.factory("panes.history", history);
		
	history.$inject = ["core.History"];
	
	function history(History) {
		
		var history = new History();
		
		return history;
	}
})();