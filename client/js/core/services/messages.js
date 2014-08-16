(function() {
	angular.module("core")
		.factory("messages", messages);
	
	messages.$inject = ["messageFactory"];
	
	function messages(messageFactory) {
		
		var receivers = {};
		
		return {
			register: function(supply) {
				var man = new MessageMan(supply),
					stored = receivers[man.name];
				if(!stored)
					receivers[man.name] = [man];
				else
					stored.push(man);
				return man;
			}
		};
		
		function MessageMan(supply) {
			try {
				this.name = supply.$get.name;
			} catch (e) {
				throw "Invalid message supplier.";
			}
		}
		
		MessageMan.prototype = {
			name: null,
			listeners: {},
			
			send: function(target, event, data) { // Send Message object or create new message out of target, event and data
				var message = messageFactory.check(target) && target || messageFactory.create(target, event, data);
				
				receivers[new MessageMan(target).name].forEach(function(receiver) {
					receiver.receive(message);
				});
			},
			on: function(event, listener) {
				if(typeof listener === "function")
					this.listeners[event] = listener;
			},
			receive: function(message) {
				var c;
				
				if(messageFactory.check(message) && message.receiver == this.name && typeof (c = this.listeners[message.event]) === "function")
					c(message.event, message.data);
			}
		};
	}

})();
