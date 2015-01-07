var connector = (function() {

	var callbackStore = new Map(),
		storePos = 1,
		connected = false,
		application = "runnrConnectorV1",
		eventListeners = new Map();

	var protocol = {

		init: function() {

			var t = this;

			window.addEventListener("message", function(event) {
				t.receive(event);
			}, false);

			t.send.handshake();

		},

		send: {

			id: Date.now()+Math.random(),

			_getId: function() {
				return ((storePos = storePos+1)%Number.MAX_VALUE);
			},

			_do: function(message) {
				window.parent.postMessage(message, "*");
			},

			handshake: function() {
				this._do({ type:"handshake", id:this.id, application:application });
			},

			message: function(message, callback, responseTo) {
				var id = this._getId();

				if(!connected)
					return;

				this._do(target, { type:"message", id:id, message:message, responseTo:responseTo });
				if(typeof callback == "function")
					callbackStore.set(id, callback);
			}
		},

		receive: function(event) {
			var t = this,
				data = event.data,
				sender = event.source;
			if(!connected && data.type == "handshake" && data.application == application && data.id == t.send.id) {
				connected = true;
				return;
			}
			if(data.type == "message") {
				if(!data.responseTo) {
					var called = false;
					var responseFunction = function(response) {
						if(called)
							return;
							t.send.message(sender, response, null, data.id);
							called = true;
					}, result = receive("message", data.message, responseFunction);

					if(!called && !result)
						responseFunction(undefined);
				}
				else if(callbackStore.has(data.responseTo))
					callbackStore.get(data.responseTo)();
			}
		}
	};

	//api is plugin specific! runner logic will be separated and the protocol put in an abstract container for both.

	// this function is part of the plugin api and converts abstract messages to plugin messages.
	function receive(type, data, callback) {

	}

	var api = {
		// TODO: Implement plugin side of connector logic
		send: function(event, data, callback) {

		},

		addEventListener: function(event, callback) {

		},

		removeEventListener: function(event, callback) {

		}
	};

	protocol.init();

	return api;
}());
