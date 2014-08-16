(function() {
	angular.module("core")
		.factory("messageFactory", messageFactory);
	
	messageFactory.$inject = [];
	
	function messageFactory() {
		return {
			create: function(receiver, event, data) {
				return new Message(receiver, event, data);
			},
			check: function(message) {
				return message instanceof Message;
			}
		};
	}
	
	function Message(receiver, event, data) {
		this.receiver = receiver;
		this.event = event;
		this.data = data;
	}
})();