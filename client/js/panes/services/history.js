(function() {
	angular.module("panes")
		.factory("panes.history", historyFactory);

	historyFactory.$inject = ["core.History"];

	function historyFactory(History) {

		var history = new History();

		history.validateState = function(state) {
			state = History.prototype.validateState(state, true);
			if(!state.data.name) // only accept states with a name -> plugins or runners
				return;
			state.id = this.states.length + "" + state.data.name + Date.now();
			return state;
		};

		return history;
	}
})();
