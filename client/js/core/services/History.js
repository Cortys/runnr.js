(function() {
	angular.module("core")
		.factory("core.History", HistoryFactory);

	HistoryFactory.$inject = ["core.State"];

	function HistoryFactory(State) {
		
		function History() {
			this.states = [];
		}
		
		History.prototype = {
			states: null,
			lastMove: 0,
			
			validateState: function(state, noId) {
				return State.isAppendable()?state:new State(state, noId?undefined:this.states.length);
			},
			
			pushState: function(state) {
				this.states.push(this.validateState(state));
				this.lastMove = 1;
			},
			replaceState: function(state) {
				this.states = [];
				this.pushState(state);
				this.lastMove = 0;
			},
			
			backBy: function(by) {
				if(by === undefined)
					by = 1;
				if(isNaN(by))
					return;
				this.states = this.states.slice(0, Math.max(this.states.length - by, 0));
				this.lastMove = -by;
			},
			
			backTo: function(to) {
				if(isNaN(to))
					return;
				to = Math.min(to, this.states.length-1);
				this.lastMove = to - this.states.length
				this.states = this.states.slice(0, to+1);
			},
			
			getState: function(back) {
				if(back === undefined)
					back = 0;
				if(isNaN(back))
					return;
				return this.states[this.states.length-1-back];
			},
			
			getStates: function(back) {
				if(isNaN(back))
					return;
				return this.states.slice(-back);
			}
		};
		
		return History;
	}
})();