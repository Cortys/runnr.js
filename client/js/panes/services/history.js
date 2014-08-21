(function() {
	angular.module("panes")
		.factory("panes.history", historyFactory);
		
	historyFactory.$inject = ["core.History"];
	
	function historyFactory(History) {
		
		var history = new History();
		
		history.validateState = function(state) {
			state = History.prototype.validateState(state, true);
			state.id = this.states.length + state.data.text;
			return state;
		};
			
		return history;
	}
})();
