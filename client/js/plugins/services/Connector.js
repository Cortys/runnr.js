(function() {
	angular.module("plugins")
		.factory("plugins.Connector", ConnectorFactory);

	ConnectorFactory.$inject = ["$q"];

	function ConnectorFactory($q) {

		// listener: A function, that is called, when messages are received. Connection meta messages will be hidden.
		// eventTarget: An eventTarget object, that implements the PostMessage API.
		function Connector(listener, eventTarget) {

			if(typeof listener != "function")
				throw new TypeError("The listener of Connector has to be a function!");

			var t = this,
				r = t._receive.bind(t);

			t.listener = listener;
			t.eventTarget = eventTarget;

			window.addEventListener("message", t._listener = function(event) {
				if(t.eventTarget === event.source)
					protocol.receive(event, r);
			}, false);
		}

		Connector.prototype = {
			listener: null,
			eventTarget: null,

			_connected: false,

			destroy: function() {
				window.removeEventListener("message", this._listener, false);
				this.listener = this.eventTarget = null;
			},

			// handle high level connection stuff
			_receive: function(type, data, callback) {
				if(type == "message")
					this.listener.call(undefined, data, callback);
				else if(type == "handshake")
					this._connected = true;
			},

			// sends message object and returns a promise, that is resolved with the response
			send: function(message) {
				if(!this._connected)
					return $q.reject(new Error("Connection could not be established yet."));
				var t = this;
				return $q(function(resolve, reject) {
					if(t.eventTarget)
						protocol.send.message(t.eventTarget, message, function(data) {
							if(data !== undefined)
								resolve(data);
							else
								reject();
						});
					else
						reject(new Error("Receiver could not be found."));
				});
			}
		};

		return Connector;
	}
}());
