(function() {
	angular.module("core")
		.factory("core.History", HistoryFactory);

	HistoryFactory.$inject = [];

	function HistoryFactory() {
		
		function History() {
			this.states = [];
		}
		
		History.prototype = {
			states: null,
			
			pushState: function(state) {
				this.states.push(state);
			},
			replaceState: function(state) {
				this.states = [state];
			},
			
			back: function(by) {
				if(by === undefined)
					by = 1;
				if(isNaN(by))
					return;
				this.states = this.states.slice(0, Math.max(this.states.length - by, 0));
			},
			
			getState: function(back) {
				if(back === undefined)
					back = 0;
				if(isNaN(back))
					return;
				return this.states[this.states.length-1-back];
			}
		};
		
		return History;
	}
})();