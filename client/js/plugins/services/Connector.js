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

		var callbackStore = new Map(),
			storePos = 1,

			application = "runnrConnectorV1",

		/*
			Purpose of this protocol is to verify, that both sides agree upon the same message API. Not to check the connection (it is assumed, that the browser already manages such things)! Thus a two-way handshake is used instead of the typical three-way check.

			By using an application-id plugins, that include their own implementation of the API, are blocked if the official message API of runnr is changes. This increases stability and UX when buggy or deprecated plugins are used.
		*/

		protocol = {

			send: {

				_getId: function() {
					return ((storePos = storePos+1)%Number.MAX_VALUE);
				},

				_do: function(target, message) {
					target.postMessage(message, "*");
				},

				handshake: function(target, id) {
					this._do(target, { type:"handshake", id:id, application:application });
				},

				message: function(target, message, callback, responseTo) {

					var id = this._getId();

					this._do(target, { type:"message", id:id, message:message, responseTo:responseTo });
					if(typeof callback == "function")
						callbackStore.set(id, callback);
				}
			},
			// handle low level connection stuff
			receive: function(event, callback) {
				var t = this,
					data = event.data,
					sender = event.source;
				if(data.type == "handshake" && data.application == application) {
					t.send.handshake(sender, data.id);
					callback("handshake");
					return;
				}
				if(data.type == "message") {
					if(!data.responseTo)
						callback("message", data.message, function(response) {
							t.send.message(sender, response, null, data.id);
						});
					else if(callbackStore.has(data.responseTo))
						callbackStore.get(data.responseTo)();
				}
			}
		};

		return Connector;
	}
}());
