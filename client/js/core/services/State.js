(function() {
	angular.module("core")
		.factory("core.State", StateFactory);

	StateFactory.$inject = [];

	function StateFactory() {

		function State(data, id) {
			this.data = State.isState(data)?state.data:data;
			
			Object.defineProperty(this, "id", {
				get: function() {
					return id;
				},
				set: function(val) {
					if(id == undefined)
						id = val;
				}
			});
		}
		
		State.prototype = {
			isIdentified: function() {
				return this.id !== null;
			}
		};
		
		State.isState = function(state) {
			return state instanceof State;
		};
		State.isAppendable = function(state) {
			return State.isState(state) && state.isIdentified();
		};

		return State;
	}
})();