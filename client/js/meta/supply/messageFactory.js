(function() {
	angular.module("meta")
		.factory("messageFactory", messageFactory);

	messageFactory.$inject = [];

	function messageFactory() {
		return {
			send: function() {
				return {
					
				};
			}
		};
	}

})();
