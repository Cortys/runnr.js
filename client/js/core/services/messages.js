(function() {
	angular.module("core")
		.factory("messages", messages);
	
	messages.$inject = ["messageFactory"];
	
	function messages(messageFactory) {
		
		var receivers = {},
			noDelivery = {};
		
		function Deliverer(supply) {
			this.name = supply.toString();
		}
		
		Deliverer.prototype = {
			name: null,
			listeners: {},
			
			/* Send Message
			 * target: registered name of the receiver
			 * event: topic of the message
			 * data: appended data object
			 * minDelivery: required number of receivers. if not exceeded the message will be stored until new receivers appear. default = 1
			 */
			send: function(target, event, data, minDelivery) {
				var message = messageFactory.check(target) && target || messageFactory.create(target, event, data),
					receiverList = receivers[target] || [],
					noDeliveryTarget, noDeliveryEvents;
				
				minDelivery = (minDelivery === undefined?1:minDelivery) - receiverList.length;
				
				// deliver messages:
				receiverList.forEach(function(receiver) {
					receiver.receive(message);
				});
				
				// store message, if further deliveries are necessary
				if(minDelivery > 0) {
					if(!(noDeliveryTarget = noDelivery[target]))
						noDelivery[target] = noDeliveryTarget = {};
					if(!(noDeliveryEvents = noDeliveryTarget[event]))
						noDeliveryTarget[event] = noDeliveryEvents = [];
					
					noDeliveryEvents.push({
						message: message,
						deliveriesLeft: minDelivery
					});
				}
				
				return this;
			},
			on: function(event, listener) {
				
				var t = this,
					noDeliveryTarget, noDeliveryEvents, removedAll;
				
				if(typeof listener === "function") {
					t.listeners[event] = listener;
					
					if((noDeliveryTarget = noDelivery[this.name]) && (noDeliveryEvents = noDeliveryTarget[event])) {
						removedAll = true;
						noDeliveryEvents.forEach(function(e, i) {
							t.receive(e.message);
							if(--e.deliveriesLeft <= 0)
								delete noDeliveryEvents[i];
							else
								removedAll = false;
						});
						if(removedAll)
							delete noDeliveryTarget[event];
					}
				}
				
				return this;
			},
			receive: function(message) {
				var c;
				if(messageFactory.check(message) && message.receiver == this.name && typeof (c = this.listeners[message.event]) === "function")
					c(message.event, message.data);
			}
		};
		
		return {
			register: function(supply) {
				var deliverer = new Deliverer(supply),
					stored = receivers[deliverer.name];
				if(!stored)
					receivers[deliverer.name] = [deliverer];
				else
					stored.push(deliverer);
				return deliverer;
			}
		};
	}

})();
