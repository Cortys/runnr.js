/*
The connector protocol file contains the basic connector specification.
It has to be included on both plugin and main app side.

Purpose of this protocol is to verify, that both sides agree upon the same message API.
Not to validate the connection (it is assumed, that the browser already manages such things)!
Thus a two-way handshake is used instead of the typical three-way check.

By using an application-id, plugins/runners, that include their own implementation of the protocol, are blocked if the official message API of runnr is changes. This increases stability and UX when buggy or deprecated plugins are used.
*/

var connector = {};

connector._protocol = (function() {

	var callbackStore = new Map(),
		storePos = 0,
		application = "runnrConnectorV1";

	// Returns a unique id: Used to identifiy responses to sent messages
	function getId() {
		return (storePos = (storePos+1)%Number.MAX_VALUE);
	}

	var protocol = {

		listen: function(target, callback) {
			var t = this;
			window.addEventListener("message", function(event) {
				if(target === event.source)
					t.receive(event, callback);
			}, false);
		},

		send: {

			_do: function(target, message) {
				target.postMessage(message, "*");
			},

			handshake: function(target, isResponse) {
				this._do(target, { type:"handshake", id:this.id, isResponse:!!isResponse, application:application });
			},

			message: function(target, message, callback, responseTo) {
				var id = this.getId();

				if(!connected)
					return;

				this._do(target, { type:"message", id:id, message:message, responseTo:responseTo });
				if(typeof callback == "function")
					callbackStore.set(id, callback);
			}
		},

		// Parses a postMessage event object and calls callback with results
		receive: function(event, callback) {
			var t = this,
				data = event.data,
				sender = event.source;
			if(!connected && data.type == "handshake" && data.application === application) {
				if(!data.isResponse)
					t.send.handshake(true);
				callback("handshake");
				return;
			}
			if(data.type == "message") {
				// Message was initiated by sender:
				if(!data.responseTo) {
					var called = false;
					var respond = function(response) {
						if(called)
							return;
						t.send.message(sender, response, null, data.id);
						called = true;
					}, result = callback("message", data.message, respond);

					// If callback did not send response sync and did not set a async flag (callback return == true):
					if(!called && !result)
						respond(undefined); // Respond to message with no data.
				}
				// Message was sent in response to a message we sent before:
				else if(callbackStore.has(data.responseTo)) {
					callbackStore.get(data.responseTo)(data.message);
					callbackStore.delete(data.responseTo);
				}
			}
		}
	};

	Object.freeze(protocol);
	Object.freeze(protocol.send);

	return protocol;
}());
